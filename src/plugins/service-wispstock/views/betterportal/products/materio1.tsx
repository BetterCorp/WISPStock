/** @jsxImportSource jsx-htmx */

import { BetterPortalUIView } from "@bettercorp/betterportal";
import { ViewDefinition } from "./index";

export const Component: BetterPortalUIView<ViewDefinition> = (props) => {
  const page = props.outboundData.page,
    products = props.outboundData.products,
    total = props.outboundData.total,
    perPage = props.outboundData.perPage,
    totalPages = Math.ceil(total / perPage);
  // cards black background smimilar to theme colors

  const productsList = products.map((product) => (
    <div
      class="card border rounded-3 bg-white text-center m-3 p-0"
      style="width: 15rem;
          background-image: linear-gradient(#28243d, #9260ff)"
    >
      <img src={product.img} class="rounded p-3" style=""></img>
      <div class="card-body">
        <div class="card-title">
          <h5 class="text-white ">{product.title}</h5>
        </div>
      </div>
      <div class="card-body">
        <p class="text-white card-text">SKU: {product.sku}</p>
      </div>
    </div>
  ));

  return {
    status: 200, 
    content: (
      <div class="container">
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
          {page > 1 ? (
            <button
              class="btn btn-light"
              hx-trigger="click"
              hx-get={`/products?page=${page - 1}`}
            >
              Previous Page
            </button>
          ) : null}
          <span class="fw-bold fs-5">Page {page}</span>
          {page < totalPages ? (
            <button
              class="btn btn-light"
              hx-trigger="click"
              hx-get={`/products?page=${page + 1}`}
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
      </div>
    ),
  };
};
