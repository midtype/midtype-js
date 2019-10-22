# Midtype.js

Midtype.js makes it easy to use Midtype backends in HTML and Webflow projects. Please note that in this README, we will be using [some of terms defined here](https://www.midtype.com/docs/getting-started/definitions/).

## Getting Started

To use Midtype in your HTML or Webflow project, [sign up](https://www.midtype.com/docs/getting-started) for an account and design your API. The names of the models and fields you define in the Midtype UI determine how you access that data to perform create, read, and update operations with this SDK.

### Quickstart

---

#### Step 1: Insert Your Snippet

Paste your code snippet before the `</head>` tag in every page of your project. For Webflow, this is done by navigating to your site's project settings (`https://webflow.com/dashboard/sites/[SITE_NAME]/general`) > Code > Head Code:

<img src="images/webflow-custom-code.png" alt="Adding your code snippet in Webflow" width="700"/>

Here's a sample of what the code snippet should look like:

```html
<script
  type="application/javascript"
  src="https://storage.googleapis.com/midtype-assets/js/v1.1.js"
></script>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    Midtype.init({
      projectId: '[MIDTYPE_PROJECT_NAME]',
      endpoint: '[MIDTYPE_PROJECT_ENDPOINT]',
      redirectUrl: '[VALID_REDIRECT_URL]', // This is should be a URL on your domain
      redirects: {
        signedOut: [], // Array of redirect objects to enforce when visit is not signed in.
        signedIn: [] // Array of redirect objects to enforce when visit is signed in.
      }
    });
  });
</script>
```

---

#### Step 2: Add a Login Button

Add an HTML button on your page with the `data-mt-action="login"` tag:

```html
<button data-mt-action="login">Login</Login>
```

Do this in Webflow by adding a button to your layour, and specifying a custom attribute in the "Element Settings (D)" section for the button:

<img src="images/webflow-custom-attribute.png" alt="Adding a custom attribute in Webflow" width="200"/>

Clicking this button will open up a login menu for your app. Log into the app to continue.

---

#### Step 3: Show User data

Once a user is logged in. Let's add a `<h1>` that displays their name and an `<img>` with their profile picture. We must wrap these elements in a div that specifies the model we're getting data from. In this case, it's the `user` model:

```html
<div data-mt-query="user">
  <h1 data-mt-field="private.name"></h1>
  <img
    data-mt-field="private.photoUrl"
    data-mt-field-attribute="src"
    width="100"
  />
</div>
```

Now, we can do the same for any other model we have [defined in our Midtype project](https://app.midtype.com/models). See the full API reference below for the list of data attributes that can be used.

## API Reference

<<<<<<< HEAD
You can easily attach data to your HTML elements using `data` attributes. You can also perform standard create and update operations on any object using HTML forms in conjunction with these attributes.

| Attribute                   | Value                                          | HTML Elements | Purpose                                                                                                                                                                                                                                              |
| --------------------------- | ---------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data-mt-query`             | Any Model Name                                 | All           | Show data for a single record. Must be used in conjunction with `data-mt-query-id` unless the model is `user`.                                                                                                                                       |
| `data-mt-query-id`          | `UUID`                                         | All           | Must be used in conjunction with `data-mt-query` to specify which record to show data for.                                                                                                                                                           |
| `data-mt-query-all`         | Any Model Name                                 | All           | Show all records of the given model. Immediate child of element with this attribute must be a `<div>`.                                                                                                                                               |
| `data-mt-field`             | Any Field for Parent Model                     | All           | When used as a child of an element with `data-mt-query` or `data-mt-query-all`, it is injected with data from the given field. Supports dot notation for sub-fields (e.g. `photo.location`)                                                          |
| `data-mt-mutate`            | Any Model Name                                 | `<form>`      | Allows user to create or update records of this model, based on child `<input>` elements. `<form>` must include an `<input type="submit" />` element.                                                                                                |
| `data-mt-mutate-id`         | `UUID`                                         | `<form>`      | If used in conjunction with `data-mt-mutate`, allows user to update fields on the record with the given ID.                                                                                                                                          |
| `data-mt-mutate-field`      | Any Field for Parent Model                     | `<input>`     | When user submits the given form, the `value` attribute for this input will be saved for this the given field.                                                                                                                                       |
| `data-mt-mutate-field-type` | `user`, `number`, `string`, `asset`, `boolean` | `<input>`     | The data type for a given input field. If the value is `asset`, the `<input>` must also have attribute `type="file"`. If value is `boolean`, `<input>` must also have attribute `type="checkbox"`. If no field type specified, defaults to `string`. |
| `data-mt-action`            | `login`, `logout`                              | `<button>`    | Any button with this tag will initiate the action specified in the value when it is clicked.                                                                                                                                                         |
| `data-mt-action-form`       | `register`, `confirmUser`                      | `<form>`      | Any button with this tag will initiate the action specified in the value when it is clicked.                                                                                                                                                         |
| `data-mt-action-form-field` |                                                | `<input>`     | Any button with this tag will initiate the action specified in the value when it is clicked.                                                                                                                                                         |  |
| `data-mt-if`                | `user`                                         | All           | Any element with this tag will be shown only if there is a user currently logged in.                                                                                                                                                                 |
| `data-mt-if-not`            | `user`                                         | All           | Any element with this tag will be shown only if there is **not** a user currently logged in.                                                                                                                                                         |

=======

### HTML Attributes API

You can easily attach data to your HTML elements using `data` attributes. You can also perform standard create and update operations on any object using HTML forms in conjunction with these attributes.

#### `data-mt-query`

Value can be the name of any model in your Midtype projects. Fetches data for a single record. Must be used in conjunction with `data-mt-query-id` unless the value is `user`.

#### `data-mt-query-id`

Value must be a valid `UUID` for an existing record of the parent model. Must be used in conjunction with `data-mt-query` to specify which record to show data for.

#### `data-mt-query-all`

Value can be the name of any model in your Midtype projects. Fetches data for up to 50 records of the given model. The immediate child of an element with this attribute will be replicated as many times as there are records of this model.

#### `data-mt-field`

Value can be any field that exists on the parent model. When used as a child of an element with `data-mt-query` or `data-mt-query-all` attributes, the `innerHTML` of this element is replaced with data from the given field. Supports dot notation for sub-fields (e.g. `photo.location`).

#### `data-mt-field-attribute`

Value can be any field that exists on the parent model. When used as a child of an element with `data-mt-query` or `data-mt-query-all` attributes, instead of replacing the element's `innerHTML` with the field's value, we set the specified attribute of this element with the field value. For example, if used as `data-mt-field-attribute="value"`, we will replace the `value` attribute of the element with the field value. Useful for sending pre-filled data through in HTML forms (like the logged in user's email) without the user having to specify it.

#### `data-mt-mutate`

Value can be the name of any model in your Midtype projects. Must be used on a `<form>` element. Allows logged in user to create or update a record of this model. based on child `<input>` elements. `<form>` must include an `<input type="submit" />` element. If neither `data-mt-mutate-id` nor `data-mt-mutate-id-value` attributes are present on same element, it submitting the form will create a new record.

#### `data-mt-mutate-id`

Value must be a valid `UUID` for an existing record of the parent model. Must be used on a `<form>` element that also contains `data-mt-mutate` attribute. Specifies which record the mutation form should update.

#### `data-mt-mutate-id-value`

Value must be a valid field for the parent model that is referenced in a `data-mt-query` or `data-mt-query-all` attribute. Must be used on a `<form>` element that also contains `data-mt-mutate` attribute. Can be used in place of `data-mt-mutate-id` if you'd like to programmatically assign the ID of the record to be updated by a mutation form. Value is injected after parent query is run.

#### `data-mt-mutate-field`

Value must be a valid field for the parent model that is being mutated. Must be an `<input>` element. When user submits the given form, the `value` attribute for this input will be saved for this the given field.

#### `data-mt-mutate-field-type`

Value must be one of:

- `number`
- `string`
- `asset`
- `boolean`.

Must be an `<input>` element. Specifies the data type for a given input field. If the value is `asset`, the `<input>` must also have attribute `type="file"`. If value is `boolean`, `<input>` must also have attribute `type="checkbox"`. If no field type specified, defaults to `string`.

#### `data-mt-action`

Value must be one of:

- `loginGoogle`
- `logout`

Can only be used on a `<button>` element. Adding this attribute will cause an action when the button it's attached to is clicked: for `login`, it will redirect user to Google for sign in. For `logout`, it will immediately log out the user.

#### `data-mt-action-form`

Value must be one of:

- `verifyEmail`
- `signup`
- `login`
- `subscribe`.

Must be a `<form>` element. Any form with this tag will perform a specific GraphQL mutation when the `<submit>` button is clicked. In order for the mutation to successfully happen, your Midtype project must have the mutation enabled. See appendix for more details on `data-mt-action-form` usage.

#### `data-mt-action-form-field`

Value must be a valid input field for the parent `action-form` mutation. See appendix for details on usage.

#### `data-mt-if`

Value can be `user` or a valid field for the parent model that is referenced in a `data-mt-query` or `data-mt-query-all` attribute. If the specified field exists, the element will be **shown**. Otherwise it will be hidden. If the value is set to `user`, the element will only be shown if the user is **logged in**.

#### `data-mt-if`

Value can be `user` or a valid field for the parent model that is referenced in a `data-mt-query` or `data-mt-query-all` attribute. Acts as the opposite of `data-mt-if`. If the specified field exists, the element will be be **hidden**. Otherwise it will be shown. If the value is set to `user`, the element will only be shown if the user is **logged out**.

### Javascript API

Once the `Midtype` object has been configured with the `init` function, it can then be used to access a number of resources via Javascript on the frontend. Refer to the table below for a list of properties and methods associated with the `Midtype` object.

#### `Midtype.init(config)`

Function used to initialize the Midtype object with your project parameters. See above for configuration options. The Typescript definitions for the config object are as follows:

```typescript
/// <reference types="react-scripts" />

interface IMidtypeConfig {
  projectName: string; // Your Midtype project ID
  projectId: number; // Your Midtype project number
  redirectUrl: string; // Where users should be redirected to after logging in with Google.
  redirects?: { signedIn?: IRedirect[]; signedOut: IRedirect[] }; // Arrays of redirect rules for signed in and signed out users.
  stripe?: IStripeConfig; // Optional. Can be passed in now, or can be passed in as a parameter to the Midtype.enableStripe() function.
  onError?: (action: IMidtypeActionRef, e: Error) => void; // Optional. A function that will be called every time Midtype encounters an error.
}

interface IStripeConfig {
  pk: string; // Your Stripe publishable key
  options?: any; // Any additional options to pass into the Stripe Elements init function (see: https://stripe.com/docs/stripe-js/reference#stripe-elements)
}

/**
 * A single redirect rule configuration.
 */
interface IRedirect {
  paths: string[]; // The paths that should obey this rule. The current path is checked against each string in this array to see if it starts with it. So including a string `/blog` in this array will ensure all paths that begin with `/blog` obey this rule.
  redirect: string; // Where the visitor should be redirected.
}

interface IMidtypeActionRef {
  id: string; // The name of the action that Midtype is trying to perform.
  el: HTMLElement; // The DOM element with an HTML tag that triggered the action.
  field?: string; // Optional. Provides extra context about the field or child element that caused an error.
}
```

#### `Midtype.fetch(query, variables?)`

Wrapper around [the Javascript fetch function](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) that has your Midtype API endpoint, authorization bearer token, and necessary GraphQL headers already configured. Useful for easily sending queries to your Midtype API if the HTML attributes API is not sufficient. Query argument must be a string and variables must be supplied as a JSON object.

#### `Midtype.getJWT()`

Function to retrieve the the JSON Web Token for the currently logged in user.

#### `Midtype.logout()`

Function to sign out the currently logged in user.

#### `Midtype.enableStripe(config)`

Function to be called on any page with a Credit Card information `<input>`. Automatically replaces the input with HTML attribute `data-mt-action-form-field="creditCard"` with a PCI-compliant input designed by Stripe. See above for the input config object type definition.

#### `Midtype.endpoint`

Returns a `string` with the GraphQL endpoint for your Midtype API.

#### `Midtype.config`

Returns the `config` object supplied in the Midtype `init` function.

> > > > > > > master

### Examples

For these examples, we will assume our Midtype backend has a model named `task` with the following fields:

- `summary` - `string`
- `screenshot` - `linked asset`
- `owner` - `linked user`
- `completed` - `boolean`

---

#### Show a Single Record

To show a single data record, you can add `data-mt-query="[MODEL NAME]"` to any HTML element. This must be used in conjunction with `data-mt-query-id="[SINGLE MODEL ID]"` to specify which record, specifically, you would like to be fetched. One notable exception to this rule is the `user` model, which can be used without specifying an `id`. Omitting the `id` in this case defaults to showing data for the logged in user.

```html
<div data-mt-query="task" data-mt-query-id="312418da-de30-425a-8d6b-cad6a7402345">
  <h3>Summary: <span data-mt-field="summary"></span></h1>
  <h4 data-mt-field="owner.name"></h4>
  <img data-mt-field="screenshot.location" data-mt-field-attribute="src" width="100" />
</div>
```

If we want to show the logged-in user's data, we do not need to include a `data-mt-query-id` attribute:

```html
<div data-mt-query="user">
  <h3>Hello <span data-mt-field="name"></span>!</h1>
  <h4 data-mt-field="email"></h4>
  <img data-mt-field="photoUrl" data-mt-field-attribute="src" width="100" />
</div>
```

---

#### Show a List of Records

The `data-mt-query-all` tag can be used similarly to `data-mt-query`, except it will automatically fetch all records of the model you specify that the logged in user has access to. **The immediate child of any HTML element with this tag must be a `<div>`.** This child `<div>` will be duplicated for the number of records that exist for this model.

```html
<div data-mt-query-all="task">
  <div>
    <h3>Summary: <span data-mt-field="summary"></span></h1>
    <h4 data-mt-field="owner.name"></h4>
    <img data-mt-field="screenshot.location" data-mt-field-attribute="src" width="100" />
  </div>
</div>
```

---

#### Create a New Record

In this example, we'll show how to create a new record and prefill the logged in user's ID in order to automatically link the newly created record to that user. For better UX, you might also want to hide the input field with the user's ID prefilled so that your users are not confused by it or edit it by mistake.

```html
<form data-mt-mutate="task" data-mt-query="user">
  <!-- data-mt-field attribute corresponds to the logged in user's ID, because the parent element has a data-mt-query="user" attribute. -->
  <input
    type="text"
    data-mt-mutate-field="ownerId"
    data-mt-field="id"
    data-mt-field-attribute="value"
    style="display: none"
  />
  <!-- the data-mt-field=attribute="value" tag automatically populates the input's value with the logged in user's ID -->
  <input
    type="text"
    data-mt-mutate-field="summary"
    data-mt-mutate-field-type="string"
  />
  <input
    type="file"
    accept="image/png, image/jpeg"
    data-mt-mutate-field="screenshotId"
    data-mt-mutate-field-type="asset"
  />
  <input
    type="checkbox"
    data-mt-mutate-field="completed"
    data-mt-mutate-field-type="boolean"
  />
  <input type="submit" value="Submit" />
</form>
```

---

#### Update an Existing Record

The HTML for updating a record is almost identical to that for creating one, except we must also specify a `data-mt-mutate-id` value.

```html
<form
  data-mt-mutate="task"
  data-mt-mutate-id="312418da-de30-425a-8d6b-cad6a7402345"
>
  <input
    type="text"
    data-mt-mutate-field="ownerId"
    data-mt-field="id"
    data-mt-field-attribute="value"
    style="display: none"
  />
  <input
    type="text"
    data-mt-mutate-field="summary"
    data-mt-mutate-field-type="string"
  />
  <input
    type="file"
    accept="image/png, image/jpeg"
    data-mt-mutate-field="screenshotId"
    data-mt-mutate-field-type="asset"
  />
  <input
    type="checkbox"
    data-mt-mutate-field="completed"
    data-mt-mutate-field-type="boolean"
  />
  <input type="submit" value="Submit" />
</form>
```

---

#### Create a Stripe Subscription

This is an example of an HTML Action form that performs a specific Midtype action. In this case, it subscribes the logged in user to a plan you've configured in Midtype.

```html
<form
  data-mt-action-form="subscribe"
  data-mt-mutate-id="[UUID FOR STRIPE PLAN]"
>
  <h4>Name</h4>
  <input type="text" data-mt-action-form-field="name" />
  <h4>Street</h4>
  <input type="text" data-mt-action-form-field="addressStreet" />
  <h4>City</h4>
  <input type="text" data-mt-action-form-field="addressCity" />
  <h4>State</h4>
  <input type="text" data-mt-action-form-field="addressState" />
  <h4>Zip</h4>
  <input type="text" data-mt-action-form-field="addressZip" />
  <h4>Coupon</h4>
  <input type="text" data-mt-action-form-field="coupon" />
  <div data-mt-action-form-field="creditCard"></div>
  <input type="submit" value="subscribe" />
</form>
```

## Running This Project Locally

You can use this project as a demo to understand how the Midtype Javascript SDK works.

1. Make sure you have Node (v8.11.0+) and Yarn installed.
2. Run `yarn` in the root of this project to install dependencies.
3. Run `yarn start` in the root of this project to see a sample of the SDK being used on the `src/public/index.html` file.
4. Navigate to `localhost:3000` to see the project in action. Making changes to the source code will automatically reload the page with changes.
