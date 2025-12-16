# Config and Theme System Documentation

## Overview

The game uses a two-tier configuration system that enables runtime skinning through URL parameters. This system allows a single codebase to support multiple game variants, each with its own visual theme and game settings.

**Key Components:**
- **Config Files** (`src/config/`): Define game parameters and reference a theme
- **Theme Files** (`Themes/`): Define visual styling, images, fonts, and layout
- **Dynamic Selector** (`src/config/game-config.js`): Routes URL parameters to the correct config

## System Flow

```
URL Query Param (?config=dodge-zone)
    ↓
game-config.js (selects config file)
    ↓
Config File (e.g., dodge-zone.js) → exports { theme: "dodge-zone" }
    ↓
Theme File (e.g., Themes/dodge-zone.json)
    ↓
Preload Scene (loads theme images and fonts)
    ↓
Level Scene (receives theme data, applies to game elements)
    ↓
Game Elements (images, text, colors applied)
```

## 1. URL Query Parameter System

### How It Works

The game reads a `config` query parameter from the URL to determine which configuration to use:

```
https://yoursite.com/?config=dodge-zone
https://yoursite.com/?config=kick-frenzy
```

### Implementation

The query parameter is read in `src/config/game-config.js`:

```javascript
function getSelectedConfigName() {
    try {
        // Read from current window, then parent/top (Phaser Editor external runner may iframe the game)
        const readParam = (win) => {
            try {
                return new URLSearchParams(win.location.search).get('config');
            } catch (_) { return null; }
        };

        const fromQuery = readParam(window) || readParam(window.parent) || readParam(window.top);
        if (fromQuery && AVAILABLE_CONFIGS[fromQuery]) {
            return fromQuery;
        }
    } catch (_) {
        // In non-browser contexts, fall through to default
    }
    return 'dodge-zone'; // Default fallback
}
```

**Key Features:**
- Checks `window`, `window.parent`, and `window.top` (handles iframe scenarios)
- Validates that the config exists in `AVAILABLE_CONFIGS`
- Falls back to `'cherries'` if no valid config is provided

## 2. Config File Selection

### Config File Structure

Each config file in `src/config/` exports a JavaScript object with game-specific settings:

**Example: `src/config/dodge-zone.js`**
```javascript
export default {
    theme: "dodge-zone"  // ← Links to Themes/dodge-zone.json
};
```

**Example: `src/config/kick-frenzy.js`**
```javascript
export default {
    theme: "kick-frenzy"  // ← Links to Themes/kick-frenzy.json
};
```

### Config Registration

All config files are imported and registered in `src/config/game-config.js`:

```javascript
import kickFrenzyConfig from './kick-frenzy.js';
import dodgeZoneConfig from './dodge-zone.js';

const AVAILABLE_CONFIGS = {
    'kick-frenzy': kickFrenzyConfig,
    'dodge-zone': dodgeZoneConfig,
};
```

### Config Selection Process

1. **URL Parameter Read**: `getSelectedConfigName()` extracts the `config` parameter
2. **Config Lookup**: The parameter is used as a key in `AVAILABLE_CONFIGS`
3. **Config Export**: The selected config object is exported as the default export
4. **Theme Reference**: The config's `theme` property specifies which theme JSON to load

```javascript
const selectedName = getSelectedConfigName();
const gameConfig = AVAILABLE_CONFIGS[selectedName] || AVAILABLE_CONFIGS['dodge-zone'];

export default gameConfig;
export { selectedName as configName };
```

## 3. Theme File Association

### Theme File Location

Theme files are located in the `Themes/` directory and are named to match the `theme` property from the config:

- Config: `{ theme: "dodge-zone" }` → Theme: `Themes/dodge-zone.json`
- Config: `{ theme: "kick-frenzy" }` → Theme: `Themes/kick-frenzy.json`

### Theme File Structure

Each theme JSON file contains:

1. **Font Loading** (`fontLoader`): Specifies web fonts to load
2. **Images** (`images`): Asset keys for game elements (field, ball, bricks, etc.)
3. **Image Tints** (`imageTints`): Optional color tints for specific images (ball, cautionLine)
4. **Text Styles** (`textStyles`): Global text styling applied to all text elements

**Example: `Themes/dodge-zone.json`**
```json
{
  "fontLoader": {
    "fonts": ["Jersey15-Regular"]
  },
  "images": {
    "field": {
      "type": "image",
      "key": "Field",
      "imageKey": "DodgeField"
    },
    "ball": {
      "type": "image",
      "key": "Ball",
      "imageKey": "Breaker_DodgeBall"
    },
    "brick-shadow": {
      "type": "image",
      "key": "BrickShadow",
      "imageKey": "Btn_OtherButton_Square08"
    },
    "brick-color": {
      "type": "image",
      "key": "BrickColor",
      "imageKey": "Btn_OtherButton_Square09"
    },
    "manBody": {
      "type": "image",
      "key": "ManBody",
      "imageKey": "ManBody"
    }
  },
  "imageTints": {
    "ball": {
      "topLeft": "#fc0845",
      "topRight": "#ff1010",
      "bottomLeft": "#a400fb",
      "bottomRight": "#a400fb"
    },
    "cautionLine": {
      "topLeft": "#f300f5",
      "topRight": "#f300f5",
      "bottomLeft": "#f300f5",
      "bottomRight": "#f300f5"
    }
  },
  "textStyles": {
    "fontFamily": "Jersey15-Regular",
    "tint": {
      "bottomLeft": "#e250ff",
      "bottomRight": "#008bd5"
    },
    "stroke": {
      "color": "#000000",
      "thickness": 5
    },
    "shadow": {
      "offsetX": 0,
      "offsetY": 5,
      "stroke": true,
      "fill": true
    }
  }
}
```

## 4. Theme Loading and Application

### Phase 1: Preload Scene

The `Preload` scene (`src/scenes/Preload.js`) loads theme assets:

```javascript
async preload() {
    const selectedTheme = gameConfig.theme || 'default';
    const themeResponse = await fetch(`Themes/${selectedTheme}.json?t=${cacheBuster}`);
    
    if (themeResponse.ok) {
        const themeData = await themeResponse.json();
        
        // Load fonts
        if (themeData.fontLoader) {
            this.load.addFile(new WebFontFile(this.load, themeData.fontLoader.fonts));
        }
        
        // Queue theme images for loading
        // Images are loaded based on themeData.images keys
    }
}
```

**What Happens:**
- Fetches the theme JSON file based on `gameConfig.theme`
- Loads web fonts specified in `fontLoader.fonts`
- Queues image assets based on `images` block
- Images are loaded with theme keys (e.g., `Field`, `Ball`, `BrickShadow`) pointing to asset-pack images
- Stores theme data and passes it to Level scene via scene data

### Phase 2: Game Initialization

The `Level` scene (`src/scenes/Level.js`) receives theme data from Preload and stores it:

```javascript
init(data) {
    // Receive theme data from Preload scene
    this.themeData = data?.themeData || null;
}

create() {
    this.editorCreate();
    
    // Apply theme to text elements
    if (this.themeData) {
        this.applyThemeToTexts();
    }
}
```

**What Happens:**
- Receives theme data passed from Preload scene via scene data
- Stores theme data in `this.themeData` for component access
- Applies theme to all text elements in `applyThemeToTexts()`
- Components access theme via `scene.themeData`

### Phase 3: Theme Application to Elements

Theme styling is applied to game elements through utility functions and direct component access:

#### A. Image Application

Components use theme utility functions to get image keys:

```javascript
// In Ball.js, BallLauncher.js, Brick.js, Level.js
import { getThemeImageKey, applyImageTint } from './utils/themeUtils.js';

const themeData = scene.themeData;
const ballKey = themeData ? getThemeImageKey(themeData, "ball") : "Breaker_DodgeBall";
const ballImage = scene.add.image(0, 0, ballKey || "Breaker_DodgeBall");

// Apply optional tints
if (themeData) {
    applyImageTint(ballImage, themeData, "ball");
}
```

#### B. Text Styling

Text elements use the `applyTextTheme()` utility:

```javascript
// In Level.js, ScoreManager.js, BallLauncher.js
import { applyTextTheme } from './utils/themeUtils.js';

// Apply theme to text elements
if (this.themeData) {
    applyTextTheme(this.timer, this.themeData);
    applyTextTheme(this.scoreText, this.themeData);
    // ... apply to all text elements
}
```

#### C. Image Tints

Optional image tints are applied via utility function:

```javascript
// In Ball.js, BallLauncher.js
import { applyImageTint } from './utils/themeUtils.js';

// Apply tints if theme provides them
if (themeData && themeData.imageTints && themeData.imageTints.ball) {
    applyImageTint(ballImage, themeData, "ball");
}
```

#### D. Utility Functions (`themeUtils.js`)

Helper functions for theme application:

```javascript
// Get texture key from theme
export function getThemeImageKey(themeData, imageName) {
    if (!themeData || !themeData.images || !themeData.images[imageName]) {
        return null;
    }
    return themeData.images[imageName].key;
}

// Apply text theme styles
export function applyTextTheme(textObject, themeData) {
    if (!textObject || !themeData || !themeData.textStyles) return;
    
    const textStyles = themeData.textStyles;
    // Apply fontFamily, stroke, shadow, tint gradients
}

// Apply image tints
export function applyImageTint(imageObject, themeData, imageName) {
    if (!themeData || !themeData.imageTints || !themeData.imageTints[imageName]) {
        return; // No tint data, skip
    }
    // Apply tintTopLeft, tintTopRight, tintBottomLeft, tintBottomRight
}
```

## 5. The Skinning System

### How It Works Together

The combination of config files and theme files creates a complete skinning system:

1. **URL Parameter** → Selects a config file
2. **Config File** → Provides game settings + theme name
3. **Theme File** → Provides all visual styling
4. **Game Code** → Applies theme to elements at runtime

### Benefits

- **Single Codebase**: One codebase supports multiple game variants
- **Runtime Switching**: Change themes via URL parameter without code changes
- **Separation of Concerns**: Game logic separate from visual styling
- **Easy Theming**: Create new themes by adding JSON files
- **Consistent API**: All themes use the same JSON schema

### Creating a New Theme

To create a new theme:

1. **Create Config File** (`src/config/my-theme.js`):
   ```javascript
   export default {
       theme: "my-theme"  // Must match theme file name
   };
   ```

2. **Register Config** (`src/config/game-config.js`):
   ```javascript
   import myThemeConfig from './my-theme.js';
   
   const AVAILABLE_CONFIGS = {
       // ... existing configs
       'my-theme': myThemeConfig,
   };
   ```

3. **Create Theme File** (`Themes/my-theme.json`):
   ```json
   {
     "fontLoader": { "fonts": ["Your Font"] },
     "images": {
       "field": { "type": "image", "key": "Field", "imageKey": "YourFieldImage" },
       "ball": { "type": "image", "key": "Ball", "imageKey": "YourBallImage" },
       "brick-shadow": { "type": "image", "key": "BrickShadow", "imageKey": "YourShadowImage" },
       "brick-color": { "type": "image", "key": "BrickColor", "imageKey": "YourColorImage" },
       "manBody": { "type": "image", "key": "ManBody", "imageKey": "YourManBodyImage" }
     },
     "imageTints": {
       "ball": { "topLeft": "#ff0000", "topRight": "#00ff00", "bottomLeft": "#0000ff", "bottomRight": "#ffff00" },
       "cautionLine": { "topLeft": "#ff00ff", "topRight": "#ff00ff", "bottomLeft": "#ff00ff", "bottomRight": "#ff00ff" }
     },
     "textStyles": {
       "fontFamily": "Your Font",
       "tint": { "bottomLeft": "#ff0000", "bottomRight": "#0000ff" },
       "stroke": { "color": "#000000", "thickness": 5 },
       "shadow": { "offsetX": 0, "offsetY": 5, "stroke": true, "fill": true }
     }
   }
   ```

4. **Use It**: `https://yoursite.com/?config=my-theme`

### Theme Data Access

Components access theme data through:

```javascript
// Access theme data (stored in Level scene)
const themeData = this.scene.themeData;

// Access specific sections
const fieldImageKey = getThemeImageKey(themeData, "field");
const ballImageKey = getThemeImageKey(themeData, "ball");
const textStyles = themeData.textStyles;
const ballTints = themeData.imageTints?.ball;
```

**Theme Data Structure:**
- `themeData.images` - Image configurations (field, ball, brick-shadow, brick-color, manBody, titleBar)
- `themeData.imageTints` - Optional color tints for images (ball, cautionLine)
- `themeData.textStyles` - Global text styling (fontFamily, tint, stroke, shadow)
- `themeData.fontLoader` - Font loading configuration

## Summary

The config and theme system enables:

- **Dynamic Configuration**: URL parameters select game variants
- **Visual Theming**: JSON files define all visual aspects
- **Runtime Application**: Themes applied without code changes
- **Scalability**: Easy to add new themes and configs
- **Maintainability**: Clear separation between game logic and styling

This architecture allows the game to support multiple branded variants while maintaining a single, unified codebase.

