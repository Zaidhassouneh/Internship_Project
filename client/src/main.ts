import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
