# Genealogy Site Built with Quasar and Vue

This is a genealogy tool built with Quasar and Vue. There is a hosted demo of available at [https://quasar-genealogy-web-demo.chattymaps.com/](https://quasar-genealogy-web-demo.chattymaps.com/).

## Overview

The tool allows users to explore genealogical trees, enabling navigation through the family's hierarchical structure. It utilizes the fantastic topola library and can be considered a more basic version of topola-viewer.

While developing this project, I also looked into using the family-chart library. However, it wasn't immediately clear how to integrate it with GEDCOM data.

One significant limitation of the project is that all the data currently comes from a GEDCOM file that requires further handling.

I would like to have been able to use the gramps web api as the backend: [https://github.com/gramps-project/gramps-web-api](https://github.com/gramps-project/gramps-web-api). Unfortunately, my experience on the backend is with Ruby on Rails. I tried to use the database schema from gramps for a new Rails project but they have made what sounds like a bad decision to directly serialize python objects into the database as blobs. As well as making the API slow, it makes it pretty difficult to use from non-python projects.

I found this Ruby on Rails app which I might use: [https://github.com/mrysav/geneac](https://github.com/mrysav/geneac). It currently does not have an API, but that shouldn't be too hard to implement.

Another option I'm considering is to create my own backend from scratch using this schema: [https://github.com/sedelmeyer/family-genealogy-database](https://github.com/sedelmeyer/family-genealogy-database).

Once I have a robust backend working I'd like to explore what I can do with a bit of AI and existing genealogy records. I have plenty of fun ideas but first I need to get the basics working ;)

## Using this app

### Install the dependencies

```bash
yarn
# or
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
quasar dev
```

### Lint the files

```bash
yarn lint
# or
npm run lint
```

### Format the files

```bash
yarn format
# or
npm run format
```

### Build the app for production

```bash
quasar build
```

### Customize the configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).
