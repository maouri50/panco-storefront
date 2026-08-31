import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { sendOrderNotifications } from "./orderNotifications";
import { sendContactNotifications } from "./contactNotifications";
import { createCatalogItem, deleteCatalogItem, listCatalogItems, seedCatalogItems, updateCatalogItem } from "./catalogStore";
import { initialCatalogItems } from "./catalogDefaults";
import { createCashOnDeliveryReference } from "./orderReference";
import { getAnnouncementConfig, saveAnnouncementConfig } from "./announcementStore";

const catalogInput = z.object({
  slug: z.string().trim().min(2).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only."),
  name: z.string().trim().min(2).max(160),
  category: z.string().trim().min(2).max(120),
  price: z.string().trim().min(1).max(32),
  was: z.string().trim().max(32).optional(),
  image: z.string().trim().min(1).max(2000),
  gallery: z.array(z.string().trim().min(1).max(2000)).min(1).max(8),
  swatches: z.array(z.string().trim().max(32)).max(8),
  colors: z.array(z.object({ name: z.string().trim().min(1).max(80), color: z.string().trim().min(1).max(32), image: z.string().trim().min(1).max(2000) })).max(8),
  tag: z.string().trim().max(80).optional(),
  description: z.string().trim().min(12).max(2000),
  highlights: z.array(z.string().trim().min(1).max(240)).min(1).max(12),
  published: z.boolean(),
  displayOrder: z.number().int().min(0).max(9999),
});

const announcementInput = z.object({
  enabled: z.boolean(),
  messages: z.array(z.string().trim().min(1).max(120)).min(1).max(12),
  backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  textColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  fontStyle: z.enum(["mono", "serif", "sans"]),
  rotationSeconds: z.number().int().min(2).max(20),
});

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  orders: router({
    submitCashOnDelivery: publicProcedure
      .input(
        z.object({
          productName: z.string().min(1).max(120),
          productPrice: z.string().min(1).max(32),
          productImageUrl: z.string().url().max(2000),
          color: z.string().min(1).max(80),
          quantity: z.number().int().min(1).max(9),
          customerName: z.string().trim().min(2).max(120),
          phone: z.string().trim().min(6).max(40),
          address: z.string().trim().min(6).max(240),
          city: z.string().trim().min(2).max(100),
          note: z.string().trim().max(500).optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const orderReference = createCashOnDeliveryReference();

        try {
          const notifications = await sendOrderNotifications({ ...input, orderReference });
          if (notifications.email !== "sent") {
            throw new TRPCError({
              code: "PRECONDITION_FAILED",
              message: "The order desk is not configured yet. Please try again shortly.",
            });
          }

          return { success: true, orderReference, whatsappSent: notifications.whatsapp === "sent" };
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("[COD order notification]", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "We could not send your request. Please try again shortly.",
          });
        }
      }),
  }),

  contact: router({
    submit: publicProcedure
      .input(z.object({
        customerName: z.string().trim().min(2).max(120),
        email: z.string().trim().email().max(240),
        topic: z.string().trim().min(2).max(120),
        message: z.string().trim().min(8).max(3000),
      }))
      .mutation(async ({ input }) => {
        try {
          const notifications = await sendContactNotifications(input);
          if (notifications.email !== "sent" && notifications.telegram !== "sent") {
            throw new TRPCError({ code: "PRECONDITION_FAILED", message: "The Panco contact desk is not configured yet. Please try again shortly." });
          }
          return { success: true };
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("[Panco contact notification]", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "We could not send your message. Please try again shortly." });
        }
      }),
  }),

  announcements: router({
    publicConfig: publicProcedure.query(() => getAnnouncementConfig()),
    update: adminProcedure.input(announcementInput).mutation(({ input }) => saveAnnouncementConfig(input)),
  }),

  catalog: router({
    publicList: publicProcedure.query(() => listCatalogItems(true)),
    adminList: adminProcedure.query(() => listCatalogItems(false)),
    create: adminProcedure.input(catalogInput).mutation(({ input }) => createCatalogItem(input)),
    update: adminProcedure.input(z.object({ id: z.number().int().positive(), item: catalogInput })).mutation(({ input }) => updateCatalogItem(input.id, input.item)),
    remove: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => deleteCatalogItem(input.id)),
    importCurrentCatalog: adminProcedure.mutation(() => seedCatalogItems(initialCatalogItems)),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
