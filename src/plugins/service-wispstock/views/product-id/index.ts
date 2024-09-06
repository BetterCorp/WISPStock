import {
    BetterPortalUIComponentBaseTypeDefinition,
    BetterPortalUIView,
    BetterPortalUIComponentDataHandler,
    HTTP_DATA_METHOD,
  } from "@bettercorp/betterportal";
  import { z } from "zod";
  import { Plugin } from "../../plugin";
  import { T_SUPPORTED_THEMES } from "../betterportal/index";
  
  const querySchema = z.object({
  });
  const outputSchema = z.object({
    id: z.string(),
    title: z.string(),
    enabled: z.boolean(),
    brand: z.string(),
    img: z.string(),
    // link: z.string(),
    status: z.string(),
    additionalInfo: z.object({
      descriptionShort: z.string().optional(),
      images: z.array(z.string())
    })
  });
  
  
  export interface ViewDefinition
    extends BetterPortalUIComponentBaseTypeDefinition {
    context?: Plugin,
    path: "/products/:id/",
    query: typeof querySchema;
    inboundData: null;
    outputData: typeof outputSchema;
    internalData?: {};
  }
  export const ViewSchema: ViewDefinition = {
    path: "/products/:id/",
    query: querySchema,
    inboundData: null,
    outputData: outputSchema,
    methods: [
      "GET",
    ],
  };
  
  import { Component as Materio1 } from "./materio1";
  import { ProductListItem } from "src";
  
  
  
  
  
  
  export const ViewHandlers: Record<T_SUPPORTED_THEMES, BetterPortalUIView<ViewDefinition> | null> = {
    materio1: Materio1,
  };
  
  export const DataHandler: BetterPortalUIComponentDataHandler<ViewDefinition> = async (props) => {
  
  
    const session = props.context.RavenDB.openSession()
    let product = await session.load<ProductListItem>(props.params.id);
  
  
    session.dispose();
  
  
  
    if (!product)
      return {
        status: 404,
        content: null,
      };
  
    return {
      status: 200,
      content: product as any,
    };
  };
  
  
  
  
  export const DataHandlers: Record<HTTP_DATA_METHOD, BetterPortalUIComponentDataHandler<ViewDefinition> | undefined> = {
    POST: DataHandler,
    GET: DataHandler,
    PATCH: undefined,
    DELETE: undefined,
    PUT: undefined,
  };