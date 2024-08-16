import {
  BSBPluginConfig,
  BSBPluginEvents,
  BSBService,
  BSBServiceConstructor,
  ServiceEventsBase,
} from "@bettercorp/service-base";
import {BetterPortalUIClient} from "@bettercorp/betterportal/lib/plugins/service-betterportal/plugin";
import {Tools} from "@bettercorp/tools/lib/Tools";
import axios from "axios";
import {z} from "zod";
import {Product, RavenBase} from "../../index";
//import {CFTurnstiles} from "@bettercorp/service-base-plugin-cloudflare-turnstiles";
import {T_SUPPORTED_THEMES, SUPPORTED_THEMES, RegisterViews} from "./views/betterportal";
import DocumentStore from "ravendb";
import {Fastify} from "@bettercorp/service-base-plugin-fastify";
import {createReadStream, readFileSync} from "fs";
import {createHash} from "crypto";
import {join} from "path";

export const secSchema = z.object({
  maxProductsPerPage: z.number().default(30),
  db: z.object({
    url: z.string(),
    databaseName: z.string(),
    auth: z.object({
             type: z.enum([
               "pem",
               "pfx",
             ]),
             certificateFile: z.string()
                               .optional(),
             password: z.string()
                        .optional(),
             caFile: z.string()
                      .optional(),
           })
           .optional(),
  }),
});

export class Config
    extends BSBPluginConfig<typeof secSchema> {
  migrate(toVersion: string, fromVersion: string | null, fromConfig: any) {
    return fromConfig;
  }

  validationSchema = secSchema;
}

export interface ServiceTypes
    extends BSBPluginEvents {
  onEvents: {};
  emitEvents: {};
  onReturnableEvents: ServiceEventsBase;
  emitReturnableEvents: ServiceEventsBase;
  onBroadcast: ServiceEventsBase;
  emitBroadcast: ServiceEventsBase;
}


export class Plugin
    extends BSBService<Config, ServiceTypes> {
  initBeforePlugins?: string[] | undefined;
  initAfterPlugins?: string[] | undefined;
  runBeforePlugins?: string[] | undefined;
  runAfterPlugins?: string[] | undefined;
  public get Config() { return this.config; }
  public get pcwd(): string { return this.pluginCwd; }
  methods = {
    getProductImageUrl: (productId: string) => `/product-image/${productId}`,
    getProductUrl: (productId: string, dist: string) => `/product-url/${productId}/${dist}`,
    getProductDetailsUrl: (productId: string) => `/products/${productId}`,
  };

  //public CFTurnstiles: CFTurnstiles;

  dispose(): void {
    this.RavenDB.dispose();
  }

  run(): void | Promise<void> {
  }

  public RavenDB!: DocumentStore;
  private bpClient: BetterPortalUIClient<T_SUPPORTED_THEMES>;
  private fastify: Fastify;


  constructor(config: BSBServiceConstructor) {
    super(config);
    //this.CFTurnstiles = new CFTurnstiles(this);
    this.bpClient = new BetterPortalUIClient(this, SUPPORTED_THEMES);
    this.RavenDB = new DocumentStore(
        this.config.db.url,
        this.config.db.databaseName,
    );
    this.RavenDB.initialize();
    this.log.info(`Ready DB [RAVEN]`);
    this.fastify = new Fastify(this);
  }

  public async init(): Promise<void> {
    const defaultProductImageHash = createHash("md5")
        .update(readFileSync(join(this.pluginCwd, "./assets/wispstock-item.png")))
        .digest("hex");

    await this.fastify.get("/product-image/:id/", async (reply, params) => {
      this.log.info("IMG Request: {id}", {id: params.id});
      const session = this.RavenDB.openSession();
      const product = await session.load<Product>(params.id);
      session.dispose();
      if (!product) {
        this.log.warn("IMG Request: {id} - invalid product", {id: params.id});
        return reply.code(404)
                    .send(`Product ${params.id} not found`);
      }
      if ((
              product as any as RavenBase
          )["@metadata"]["@collection"] !== "products") {
        this.log.error("IMG Request: {id} - not a product", {id: params.id});
        return reply.code(404)
                    .send(`Product ${params.id} not found`);
      }
      const returnDefaultImage = () => {
        this.log.info("IMG Request: {id} - sending default image", {id: params.id});
        return reply
            .type("image/png")
            .header("Cache-Control", "public, max-age=3600")
            .header("ETag", defaultProductImageHash)
            .send(
                createReadStream(
                    join(this.pluginCwd, "./assets/wispstock-item.png"),
                ),
            );
      };
      if (
          Tools.isNullOrUndefined(product.img) ||
          !Tools.isString(product.img) ||
          !product.img.startsWith("https://")
      ) {
        return returnDefaultImage();
      }

      try {
        const response = await axios.get(product.img, {
          responseType: "stream",
        });
        this.log.info("IMG Request: {id} - sending image from [{url}]", {id: params.id, url: product.img});
        const eTag = createHash("md5")
            .update(product.img)
            .digest("hex");
        this.log.info("IMG Request: {id} - sending image from [{url}] {hash} as {type}", {
          id: params.id, url: product.img, hash: eTag,
          type: response.headers["content-type"] ?? "application/octet-stream",
        });
        return reply.type("application/octet-stream")
                    .header("Cache-Control", "public, max-age=3600")
                    .header("ETag", eTag)
                    .send(response.data);
      }
      catch (err: any) {
        this.log.error(err);
        return returnDefaultImage();
      }
    });

    await this.fastify.get("/product-url/:id/:dist/", async (reply, params) => {
      this.log.info("URL Request: {id}", {id: params.id});
      const session = this.RavenDB.openSession();
      const product = await session.load<Product>(params.id);
      session.dispose();
      if (!product) {
        this.log.warn("URL Request: {id} - invalid product", {id: params.id});
        return reply.code(404)
                    .send(`Product ${params.id} not found`);
      }
      if ((
              product as any as RavenBase
          )["@metadata"]["@collection"] !== "products") {
        this.log.error("URL Request: {id} - not a product", {id: params.id});
        return reply.code(404)
                    .send(`Product ${params.id} not found`);
      }
      if (
          Tools.isNullOrUndefined(product.additionalInfo) ||
          Tools.isNullOrUndefined(product.additionalInfo.urls) ||
          Tools.isNullOrUndefined(product.additionalInfo.urls[params.dist]) ||
          !Tools.isString(product.additionalInfo.urls[params.dist])
      ) {
        return reply.status(404)
                    .send(`Product ${params.id} not found for distributor ${params.dist}`);
      }
      return reply.status(303)
                  .header("location", product.additionalInfo.urls[params.dist])
                  .send();
    });

    RegisterViews(this.bpClient);
  }
}