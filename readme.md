# Avex Shopify Theme Boilerplate 🌠

## DEV STORE

https://onlinestore2-test.myshopify.com/

Password: **avex**

## Getting started

1. Clone the repo -

```

git clone https://github.com/avex-designs/avex-boilerplate

```

2. Install dependencies - `npm install`

3. Change git origin url -

```

git remote set-url origin new.git.url/here

git branch -M main

git push -u origin main

```

4. Connect theme in Shopify admin via Github - `Themes -> Add theme -> Connect from Github`

5. Make sure [Themekit](https://shopify.github.io/themekit) is installed - `theme help`

6. Add `config.yml` (use sample - `sample-config.yml`).

7. Run `npm run watch` to simultaneously watch, build and upload changes to Shopify

## Get familiar with folder structure
- src
	- scripts
		- components
		- sections
		- common js files
	- scss
		- blocks
		- fonts
		- images
		- partials
		- common scss files

**Components folder** - any js file that consist of web component should go to this folder and keep in mind that component name and file name should be the same e.g
for `some-random-component.js`
```js
class SomeRandomComponent extends HTMLElement {
	 // class definition here
}

customElements.define("some-random-component", SomeRandomComponent );
```

**Including css files** - to include css files there are two ways:
1. Use `stylesheet` snippet when section is not visible on the first render for e.g footer:

```
{%- render "stylesheet", name: "css-file-name-in-assets-without-min-css", defer: false -%}
```
2. Use `{%- style -%}` tag in liquid to render html style tag here for sections that are visible on first page load. e.g header, here section.
In order to generate css snippet from scss, you need to add .snippet at the and of the filename. e.g `some-file.snippet.scss`

```
{%- style -%}
  {%- render "css-snippet-file-name" -%}
{%- endstyle -%}
```

**P.S**
- if you add *.snippet-asset* at the and of the scss file name, webpack will generate both snippet and asset.
- if you add *.ignore* at the end of the scss file name, webpack will ignore it.
	
	

## Linters and formatters
We connected css, js and **liquid**(it uses experimental [formatter](http://https://shopify.dev/themes/tools/liquid-prettier-plugin "formatter") from Shopify) formatters and linters using prettier, eslint and stylelint. The root directory consist of config files and you are free to update them for your needs.

Whenever you commit to a git, all linters and formatters will run to fix and beatify you code, but, you can use VSCode features to highlight warnings and errors.

## NPM Commands

1.  `npm run zip` - creates archived theme files, ready for manual theme upload.

2.  `npm run watch` - runs webpack and themekit watch commands in parallel.

3.  `npm run build` - runs webpack build command, to compile scss/js files.

4.  `npm run export` - to unminify and un-uglify css/js files. (file names will stay .min extension)

5.  `npm run components-watch` - to watch components folder and generate global components list

6.  `npm run eslint` - to run eslint fixes

7.  `npm run prettier` - to run prettier fixes

8.  `npm run stylelint` - to run stylelint fixes

## Top Features

> 🆕 ** Webpack build on "main" branch on push request via [Github Actions](https://github.com/avex-designs/avex-boilerplate/blob/main/.github/workflows/webpack.yml "Github Actions")!** 🆕

Every time you push anything on main branch, you may see github actions run, which will use your webpack.config file and add minified and generated css/js files to the project. Please check github actions folder.

##### Implementation:

Add your user token to Shopify secrets.

1.        Go to your profile settings (https://github.com/settings/tokens)
2.        Generate new token.
3.        Go to your repo settings (https://github.com/avex-designs/your-repo-name/settings/secrets/actions)
4.        Click on "New repository secret" and add name as "DEPLOYMENT_GITHUB_TOKEN" and value as your personal token that we generated on step 2.
5.        Save and make test push request to main branch.

##### Ideal flow:

1. Connect your main branch to shopify via admin.
2. Work on development branch and make any changes you want.
3. Once you are ready to push to main branch, create PR to main branch and merge it.
4. It will merge all files and immmideatly creates a github action which will build your webpack files using your webpack config and pushes it to corresponding folders (configured in your webpack settings).

---

#### Features list:

- Upload ready built and minifed CSS/JS files to Shopify
- SCSS/JS files are divided into modular parts based on the sections
- Full integration with **Liquid Ajax Cart**. All product forms automatically ajaxified. For more details please visit [https://liquid-ajax-cart.js.org](https://liquid-ajax-cart.js.org)
- **Swiper Slider** [Docs](https://swiperjs.com/swiper-api). Please use `window.Swiper` object.

Please use only needed modules:

```javascript
import SwiperCore, {
  Navigation,
  Pagination,
  Thumbs,
  Mousewheel,
} from "swiper/core";

SwiperCore.use([Navigation, Pagination, Thumbs]);

window.Swiper = SwiperCore;
```

- Based on Shopify [DAWN Theme](https://github.com/Shopify/dawn).
- Use native shopify `image_tag` [filter](https://shopify.dev/api/liquid/filters/html-filters#image_tag).
  ✅Added new `image-acf.liquid` for acf images.

- CSS Lazyload - `/snippets/stylesheet.liquid`

- JS load using defer -

```javascript
<script src="{{ 'common.min.js' | asset_url }}" defer="defer"></script>
```

- Global SCSS Resource Loader. `src/scss/resources.scss`

```

1. REM mixin `rem(32px)`

2. Media queries mixin ` @include media($tablet){ h1{ color: red } }`

3. Feel free to add more mixins for global usage.

```

- All scripts loading from Node modules.

Install needed npm package and import it to `common.js`. Please assign your libraries to `window` object for global usage (please look to `common.js` for sample).

- ❌ THIS VERSION DOESN'T HAVE SUPPORT OF JQUERY!❌ Vanilla JS only!✅

- ❌ DOESN'T SUPPORT IE! ❌

## Reusable Web Components

**Components loder** - `components-loader.liquid`

Description:
It should be used to load web components defined in components folder dynamically(lazely). If you are using ajax to add html, please wrap your web components inside `components-loader` web component

Usage:

```html
<components-loader>
  ...
  <some-other-web-component-that-should-be-loaded />
</components-loader>
```


1.  **Modal popup**

Usage:

```html
<modal-opener class="" data-modal="#PopupModal">
  <button type="button">Open</button>
</modal-opener>

<modal-dialog id="PopupModal"> Some text or html here.... </modal-dialog>
```

2.  **Accordion** - feel free to apply styles, by default it uses html5 details style
Usage:

```html
{%- for item in accordion_items -%}
  <accordion-block>
    <details>
      <summary>{{ item.title }}</summary>
      <div>
        {{ item.content }}
      </div>
    </details>
  </accordion-block>
{%- endfor -%}
```

3.  **Product Carousel** - `common.js::160(line)`

❌Web components with Swiper js not well supported in Safari. Removed.❌

4.  **Predictive search** - `search.js` CSS (already added in common.scss)

Usage:

```html
<predictive-search data-loading-text="{{ 'accessibility.loading' | t }}">
  <form
    action="{{  routes.search_url }}"
    method="get"
    role="search"
    class="search"
  >
    <div class="field">
      <input
        class="search__input field__input"
        id="Search-In-Template"
        type="search"
        name="q"
        value="{{  search.terms | escape }}"
        placeholder="{{ 'general.search.search' | t }}"
        role="combobox"
        aria-expanded="false"
        aria-owns="predictive-search-results-list"
        aria-controls="predictive-search-results-list"
        aria-haspopup="listbox"
        aria-autocomplete="list"
        autocorrect="off"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
      />

      <input name="options[prefix]" type="hidden" value="last" />

      <div
        class="predictive-search predictive-search--search-template"
        tabindex="-1"
        data-predictive-search
      >
        <div class="predictive-search__loading-state">
          <div class="spinner">Loading</div>
        </div>
      </div>

      <span
        class="predictive-search-status visually-hidden"
        role="status"
        aria-hidden="true"
      ></span>

      <button
        type="submit"
        class="search__button field__button"
        aria-label="{{ 'general.search.search' | t }}"
      >
        {%- render 'icon-search' -%}
      </button>
    </div>
  </form>
</predictive-search>
```

**Don't forget to copy/paste `predictive-search.liquid` section if you don't have one.**

5.  **Product Recommendations** - `product-recommendations.js`

Usage:

```html
<product-recommendations
  data-url="{{  routes.product_recommendations_url }}?section_id={{  section.id }}&product_id={{  product.id }}&limit=4"
>
  {%- if recommendations.performed and recommendations.products_count > 0 -%}
  {%- for product in recommendations.products -%} {%- render 'product-card',
  product: product -%} {% endfor %} {%- endif -%}
</product-recommendations>
```

6. 🆕**Klaviyo Back in Stock widget**

<br>Usage:

```html
1. Copy paste {%- section 'klaviyo-backinstock' -%} to theme.liquid 2. In
product.liquid add
<script type="application/json" data-bis-variants>
  {{  product.variants | json }}
</script>
inside product form. (if you already have it just add data-bis-vaiants
attribute) 3. Adjust klaviyo ID in this section. (in code or create section
fields and let the client to edit it)
```

## Contributors

<!-- Copy-paste in your Readme.md file -->

<a  href="https://github.com/Sanj718">

<img  src="https://github.com/Sanj718.png?size=50"/>

</a>

<a  href="https://github.com/kaboomdev">

<img  src="https://github.com/kaboomdev.png?size=50"/>

</a>

<a  href="https://github.com/EvgeniyMukhamedjanov">

<img  src="https://github.com/EvgeniyMukhamedjanov.png?size=50"/>

</a>

<a  href="https://github.com/vecume">

<img  src="https://github.com/vecume.png?size=50"/>

</a>

<a  href="https://github.com/namurray">

<img  src="https://github.com/namurray.png?size=50"/>

</a>

##### License

Copyright (c) 2021 [Avex Designs](https://avexdesigns.com/)

Licensed under the MIT license.

Free as in beer 🍺.
