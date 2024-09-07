/** @jsxImportSource jsx-htmx */

import { BetterPortalUIView } from "@bettercorp/betterportal";
import { ViewDefinition } from "./index";
import fs from 'fs';
import path from "path";

export const Component: BetterPortalUIView<ViewDefinition> = (props) => {
  const products = props.outboundData.products,
    total = props.outboundData.total,
    perPage = props.outboundData.perPage,
    totalPages = Math.ceil(total / perPage);


  const productsList = products.map((product) => (

    <div class="card cardStyle border rounded-3 m-1 px-auto ">

      <div class="card-body frame text-white text-center mt-1">

      <div class="frame text-white text-center m-1"> 
          <h6 class="text-white text-center pt-4">{product.title}</h6>
      </div>
      
      <div class="d-flex justify-content-evenly pt-4">
        <p>
          <img src="https://cdn.shopify.com/s/files/1/1439/1668/t/28/assets/favicon.ico?v=69860357381422628591672729793" class="icon"></img>
        </p>
        <p>
          <img src="https://www.linktechs.net/productcart/pc/theme/adam_1_10_20/images/favicon.ico" class="icon"></img>
        </p>
        <p>
          <img src="https://www.ispsupplies.com/img/icon-192.png" class="icon"></img> 
        </p>
      </div>
      <div class="d-flex justify-content-evenly pt-4">
        <i class="icon bi bi-heart"></i>
        <i class="icon bi bi-info-circle" hx-get={props.context.methods.getProductDetailsUrl(product.id)}></i>
      </div>

      </div>
        <p class="card-text text-center py-4">SKU: {product.sku}</p>
      </div>

  ));

  return {
    status: 200, 
    content: (
      <div class="container body">
        <input
          value={props.query?.search ?? ""}
          hx-params="search"
          id="searchInput"
          data-bp-igonre-query=""
          type="text"
          name="search"
          hx-get="/products"
          hx-trigger="change"
          placeholder="Search..."
        >
        </input>
        <div class="row" id="result">
          {productsList}
        </div>

      <div class="my-3">
          <button
            class="btn btn-light"
            hx-trigger="click"
            hx-get={`/products?page=1`}
          >
            First
          </button>
          {props.outboundData.page > 1 ? (
            <button
              class="btn btn-light"
              hx-trigger="click"
              hx-get={`/products?page=${props.outboundData.page - 1}`}
            >
              Previous Page
            </button>
          ) : null}
          <span class="fw-bold fs-5">Page {props.outboundData.page}</span>
          {props.outboundData.page < totalPages ? (
            <button
              class="btn btn-light"
              hx-trigger="click"
              hx-get={`/products?page=${props.outboundData.page + 1}`}
            >
              Next Page
            </button>
          ) : null}
          <button
            class="btn btn-light"
            hx-trigger="click"
            hx-get={`/products?page=${totalPages}`}
          >
            Last
          </button>
        </div>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"></link>
        <style>{fs.readFileSync(path.join(props.context.PluginCWD, "views/betterportal/products", "materio1.css")).toString()}</style>
      </div>
    ),
  };
};
