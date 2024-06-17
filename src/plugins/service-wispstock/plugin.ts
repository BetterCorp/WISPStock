import {
  BSBPluginConfig,
  BSBPluginEvents,
  BSBService,
  BSBServiceConstructor,
  ServiceEventsBase,
} from "@bettercorp/service-base";
import {BetterPortalUIClient} from "@bettercorp/betterportal/lib/plugins/service-betterportal/plugin";
import {z} from "zod";
//import {CFTurnstiles} from "@bettercorp/service-base-plugin-cloudflare-turnstiles";
import {T_SUPPORTED_THEMES, SUPPORTED_THEMES, RegisterViews} from "./views/betterportal";
import DocumentStore from "ravendb";
//import {readFileSync} from "fs";

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
  methods = {};
  public get Config() { return this.config; }
  //public CFTurnstiles: CFTurnstiles;

  dispose(): void {
    this.RavenDB.dispose();
  }

  run(): void | Promise<void> {
  }

  public RavenDB!: DocumentStore;
  private bpClient: BetterPortalUIClient<T_SUPPORTED_THEMES>;

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
  }

  public async init(): Promise<void> {
    RegisterViews(this.bpClient);
  }
}
