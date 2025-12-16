/**
 * ThemeUtils
 * Utility functions for applying theme styling to game elements
 */

/**
 * Get theme image key from theme data
 * @param {Object} themeData - Theme data object
 * @param {string} imageName - Name of the image in theme.images (e.g., "field", "ball")
 * @returns {string|null} Texture key to use, or null if not found
 */
export function getThemeImageKey(themeData, imageName) {
    if (!themeData || !themeData.images || !themeData.images[imageName]) {
        console.warn(`[ThemeUtils] Image "${imageName}" not found in theme data`);
        return null;
    }
    
    const imageConfig = themeData.images[imageName];
    if (!imageConfig.key) {
        console.warn(`[ThemeUtils] Image "${imageName}" has no key in theme data`);
        return null;
    }
    
    // If imageKey is empty, undefined, or not provided, return null
    // This allows themes to disable certain images (e.g., manBody)
    if (!imageConfig.imageKey || imageConfig.imageKey === "") {
        console.log(`[ThemeUtils] Image "${imageName}" has empty imageKey, skipping`);
        return null;
    }
    
    return imageConfig.key;
}

/**
 * Apply image tints from theme data
 * @param {Phaser.GameObjects.Image|Phaser.GameObjects.TileSprite} imageObject - Image object to tint
 * @param {Object} themeData - Theme data object
 * @param {string} imageName - Name of the image in theme.imageTints (e.g., "ball", "cautionLine")
 */
export function applyImageTint(imageObject, themeData, imageName) {
    if (!imageObject || !themeData || !themeData.imageTints || !themeData.imageTints[imageName]) {
        return; // No tint data, skip
    }
    
    const tintData = themeData.imageTints[imageName];
    
    // Convert hex strings to integers
    const hexToInt = (hex) => {
        if (!hex) return null;
        const cleanHex = hex.replace('#', '');
        return parseInt(cleanHex, 16);
    };
    
    if (tintData.topLeft) {
        imageObject.tintTopLeft = hexToInt(tintData.topLeft);
    }
    if (tintData.topRight) {
        imageObject.tintTopRight = hexToInt(tintData.topRight);
    }
    if (tintData.bottomLeft) {
        imageObject.tintBottomLeft = hexToInt(tintData.bottomLeft);
    }
    if (tintData.bottomRight) {
        imageObject.tintBottomRight = hexToInt(tintData.bottomRight);
    }
}

/**
 * Apply a single hex tint color to an object (for nineslice objects like titleBar)
 * @param {Phaser.GameObjects.NineSlice|Phaser.GameObjects.Image} object - Object to tint
 * @param {Object} themeData - Theme data object
 * @param {string} imageName - Name of the image in theme.imageTints (e.g., "titleBar")
 */
export function applySingleHexTint(object, themeData, imageName) {
    if (!object || !themeData || !themeData.imageTints || !themeData.imageTints[imageName]) {
        return; // No tint data, skip
    }
    
    const tintValue = themeData.imageTints[imageName];
    
    // If it's a string (hex), convert it to integer
    if (typeof tintValue === 'string') {
        const cleanHex = tintValue.replace('#', '');
        object.tint = parseInt(cleanHex, 16);
    } else if (typeof tintValue === 'number') {
        // If it's already a number, use it directly
        object.tint = tintValue;
    }
}

/**
 * Apply brick text theme styles from theme data
 * @param {Phaser.GameObjects.Text} textObject - Text object to style
 * @param {Object} themeData - Theme data object
 */
export function applyBrickTextTheme(textObject, themeData) {
    if (!textObject || !themeData || !themeData.brickStyles) {
        return; // No theme data, skip
    }
    
    const brickStyles = themeData.brickStyles;
    const style = {};
    
    // Apply font family
    if (brickStyles.fontFamily) {
        style.fontFamily = brickStyles.fontFamily;
    }
    
    // Apply stroke (from textStyles.brick if it exists, for backward compatibility)
    const brickTextStyles = themeData.textStyles?.brick;
    if (brickTextStyles?.stroke) {
        if (brickTextStyles.stroke.color) {
            style.stroke = brickTextStyles.stroke.color;
        }
        if (brickTextStyles.stroke.thickness !== undefined) {
            style.strokeThickness = brickTextStyles.stroke.thickness;
        }
    }
    
    // Apply shadow (from textStyles.brick if it exists, for backward compatibility)
    if (brickTextStyles?.shadow) {
        style.shadow = {};
        if (brickTextStyles.shadow.offsetX !== undefined) {
            style.shadow.offsetX = brickTextStyles.shadow.offsetX;
        }
        if (brickTextStyles.shadow.offsetY !== undefined) {
            style.shadow.offsetY = brickTextStyles.shadow.offsetY;
        }
        if (brickTextStyles.shadow.stroke !== undefined) {
            style.shadow.stroke = brickTextStyles.shadow.stroke;
        }
        if (brickTextStyles.shadow.fill !== undefined) {
            style.shadow.fill = brickTextStyles.shadow.fill;
        }
    }
    
    // Apply style
    if (Object.keys(style).length > 0) {
        textObject.setStyle(style);
    }
    
    // Apply gradient tints (from textStyles.brick if it exists, for backward compatibility)
    if (brickTextStyles?.tint) {
        const hexToInt = (hex) => {
            if (!hex) return null;
            const cleanHex = hex.replace('#', '');
            return parseInt(cleanHex, 16);
        };
        
        if (brickTextStyles.tint.bottomLeft) {
            textObject.tintBottomLeft = hexToInt(brickTextStyles.tint.bottomLeft);
        }
        if (brickTextStyles.tint.bottomRight) {
            textObject.tintBottomRight = hexToInt(brickTextStyles.tint.bottomRight);
        }
    }
}

/**
 * Apply game message text theme styles from theme data (falls back to default if not provided)
 * @param {Phaser.GameObjects.Text} textObject - Text object to style
 * @param {Object} themeData - Theme data object
 */
export function applyGameMessageTextTheme(textObject, themeData) {
    if (!textObject || !themeData || !themeData.textStyles) {
        return; // No theme data, skip
    }
    
    // Use gameMessages if available, otherwise fall back to default
    const textStyles = themeData.textStyles.gameMessages || themeData.textStyles.default;
    if (!textStyles) {
        return; // No text styles available
    }
    
    const style = {};
    
    // Apply font family
    if (textStyles.fontFamily) {
        style.fontFamily = textStyles.fontFamily;
    }
    
    // Apply stroke
    if (textStyles.stroke) {
        if (textStyles.stroke.color) {
            style.stroke = textStyles.stroke.color;
        }
        if (textStyles.stroke.thickness !== undefined) {
            style.strokeThickness = textStyles.stroke.thickness;
        }
    }
    
    // Apply shadow (Phaser uses nested shadow properties)
    if (textStyles.shadow) {
        style.shadow = {};
        if (textStyles.shadow.offsetX !== undefined) {
            style.shadow.offsetX = textStyles.shadow.offsetX;
        }
        if (textStyles.shadow.offsetY !== undefined) {
            style.shadow.offsetY = textStyles.shadow.offsetY;
        }
        if (textStyles.shadow.stroke !== undefined) {
            style.shadow.stroke = textStyles.shadow.stroke;
        }
        if (textStyles.shadow.fill !== undefined) {
            style.shadow.fill = textStyles.shadow.fill;
        }
    }
    
    // Apply style
    if (Object.keys(style).length > 0) {
        textObject.setStyle(style);
    }
    
    // Apply gradient tints
    if (textStyles.tint) {
        const hexToInt = (hex) => {
            if (!hex) return null;
            const cleanHex = hex.replace('#', '');
            return parseInt(cleanHex, 16);
        };
        
        // Apply top corners if explicitly provided
        if (textStyles.tint.topLeft) {
            textObject.tintTopLeft = hexToInt(textStyles.tint.topLeft);
        }
        if (textStyles.tint.topRight) {
            textObject.tintTopRight = hexToInt(textStyles.tint.topRight);
        }
        
        // Apply bottom corners
        if (textStyles.tint.bottomLeft) {
            textObject.tintBottomLeft = hexToInt(textStyles.tint.bottomLeft);
        }
        if (textStyles.tint.bottomRight) {
            textObject.tintBottomRight = hexToInt(textStyles.tint.bottomRight);
        }
        
        // If only bottom values are provided and they're the same, apply to top for solid color
        if (textStyles.tint.bottomLeft && textStyles.tint.bottomRight && 
            textStyles.tint.bottomLeft === textStyles.tint.bottomRight &&
            !textStyles.tint.topLeft && !textStyles.tint.topRight) {
            const bottomColor = hexToInt(textStyles.tint.bottomLeft);
            textObject.tintTopLeft = bottomColor;
            textObject.tintTopRight = bottomColor;
        }
    }
}

/**
 * Apply text theme styles from theme data
 * @param {Phaser.GameObjects.Text} textObject - Text object to style
 * @param {Object} themeData - Theme data object
 */
export function applyTextTheme(textObject, themeData) {
    if (!textObject || !themeData || !themeData.textStyles || !themeData.textStyles.default) {
        return; // No theme data, skip
    }
    
    const textStyles = themeData.textStyles.default;
    const style = {};
    
    // Apply font family
    if (textStyles.fontFamily) {
        style.fontFamily = textStyles.fontFamily;
    }
    
    // Apply stroke
    if (textStyles.stroke) {
        if (textStyles.stroke.color) {
            style.stroke = textStyles.stroke.color;
        }
        if (textStyles.stroke.thickness !== undefined) {
            style.strokeThickness = textStyles.stroke.thickness;
        }
    }
    
    // Apply shadow (Phaser uses nested shadow properties)
    if (textStyles.shadow) {
        style.shadow = {};
        if (textStyles.shadow.offsetX !== undefined) {
            style.shadow.offsetX = textStyles.shadow.offsetX;
        }
        if (textStyles.shadow.offsetY !== undefined) {
            style.shadow.offsetY = textStyles.shadow.offsetY;
        }
        if (textStyles.shadow.stroke !== undefined) {
            style.shadow.stroke = textStyles.shadow.stroke;
        }
        if (textStyles.shadow.fill !== undefined) {
            style.shadow.fill = textStyles.shadow.fill;
        }
    }
    
    // Apply style
    if (Object.keys(style).length > 0) {
        textObject.setStyle(style);
    }
    
    // Apply gradient tints (bottomLeft, bottomRight)
    if (textStyles.tint) {
        const hexToInt = (hex) => {
            if (!hex) return null;
            const cleanHex = hex.replace('#', '');
            return parseInt(cleanHex, 16);
        };
        
        if (textStyles.tint.bottomLeft) {
            textObject.tintBottomLeft = hexToInt(textStyles.tint.bottomLeft);
        }
        if (textStyles.tint.bottomRight) {
            textObject.tintBottomRight = hexToInt(textStyles.tint.bottomRight);
        }
    }
}

