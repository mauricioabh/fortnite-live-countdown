import { z } from "zod";

export const newsMotdSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    tabTitle: z.string().optional(),
    body: z.string().optional(),
    sortingPriority: z.number().optional(),
    hidden: z.boolean().optional(),
  })
  .passthrough();

export const newsResponseSchema = z.object({
  status: z.number(),
  data: z.object({
    br: z.object({
      date: z.string(),
      motds: z.array(newsMotdSchema).optional().default([]),
    }),
  }),
});

export const shopEntrySchema = z
  .object({
    outDate: z.string(),
    inDate: z.string().optional(),
    devName: z.string().optional(),
    layout: z
      .object({
        name: z.string(),
      })
      .optional(),
    tracks: z
      .array(
        z
          .object({
            title: z.string(),
            artist: z.string().optional(),
          })
          .passthrough(),
      )
      .optional(),
    brItems: z
      .array(
        z
          .object({
            name: z.string().optional(),
          })
          .passthrough(),
      )
      .optional(),
  })
  .passthrough();

export const shopResponseSchema = z.object({
  status: z.number(),
  data: z.object({
    hash: z.string(),
    date: z.string(),
    vbuckIcon: z.string().optional(),
    entries: z.array(shopEntrySchema),
  }),
});

export type NewsResponse = z.infer<typeof newsResponseSchema>;
export type ShopResponse = z.infer<typeof shopResponseSchema>;
