import Aurelia from 'aurelia';
import { App } from './app';
import { AutoHideCustomAttribute } from './custom-attributes/auto-hide';
import { AudioEngine } from './services/audio-engine';
import { ContentManager } from './services/content-manager';
import { FlipScheduler } from './services/flip-scheduler';
import { QuoteLibrary } from './services/quote-library';
import { SettingsService } from './services/settings-service';
import { ThemeService } from './services/theme-service';
import { WeatherService } from './services/weather-service';
import { FlapBoard } from './resources/elements/flap-board/flap-board';
import { FlapCell } from './resources/elements/flap-cell/flap-cell';
import { LandingPage } from './resources/elements/landing-page/landing-page';
import { SettingsOverlay } from './resources/elements/settings-overlay/settings-overlay';
import { SideMarkers } from './resources/elements/side-markers/side-markers';
import { UppercaseValueConverter } from './value-converters/uppercase';
import './styles/app.css';

Aurelia
  .register(
    SettingsService,
    ThemeService,
    FlipScheduler,
    QuoteLibrary,
    WeatherService,
    AudioEngine,
    ContentManager,
    AutoHideCustomAttribute,
    UppercaseValueConverter,
    App,
    FlapBoard,
    FlapCell,
    SideMarkers,
    SettingsOverlay,
    LandingPage
  )
  .app(App)
  .start();
