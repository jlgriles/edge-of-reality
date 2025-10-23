# Edge of Reality - Interstellar Podcast Explorer

An immersive 3D spherical interface for exploring podcast episodes as a constellation of connected nodes.

## Table of Contents
- [Overview](#overview)
- [Category Colors](#category-colors)
- [Adding New Episodes](#adding-new-episodes)
- [Understanding Coordinates](#understanding-coordinates)
- [Enabling Spotify Embeds](#enabling-spotify-embeds)
- [Navigation](#navigation)
- [Technical Details](#technical-details)

## Overview

Edge of Reality presents podcast episodes as glowing nodes in a 3D space. Users can rotate the sphere to explore episodes, click nodes to view details, and discover connections between related content through constellation-like lines.

## Category Colors

Each podcast episode is assigned a color based on its primary category:

| Category | Color | Hex Code |
|----------|-------|----------|
| **Technology** | Cyan | `#00ffff` |
| **Science** | Magenta | `#ff00ff` |
| **Health** | Green | `#00ff00` |
| **Culture** | Yellow | `#ffff00` |
| **Business** | Orange | `#ff8800` |

**Important:** The **first** theme in the `themes` array determines the node's color. Choose your primary category carefully!

## Adding New Episodes

### Step-by-Step Guide

1. **Open `nodes-data.js`** in your text editor

2. **Add a new episode object** to the `podcastNodes` array:

```javascript
{
  id: "episode-009",
  title: "The Future of Quantum Computing",
  spotifyEmbed: "https://open.spotify.com/embed/episode/YOUR_EPISODE_ID",
  theta: 120,
  phi: 75,
  themes: ["technology", "science"]
}
```

3. **Save the file** - The new episode will appear automatically when you refresh the page!

### Episode Object Properties

| Property | Type | Description | Required |
|----------|------|-------------|----------|
| `id` | String | Unique identifier (e.g., "episode-009") | Yes |
| `title` | String | Episode title shown in tooltips and modals | Yes |
| `spotifyEmbed` | String | Spotify embed URL for the episode | Yes* |
| `theta` | Number | Horizontal position (0-360 degrees) | Yes |
| `phi` | Number | Vertical position (0-180 degrees) | Yes |
| `themes` | Array | Categories for coloring and connections | Yes |

*Currently commented out - see [Enabling Spotify Embeds](#enabling-spotify-embeds)

### Example Episodes

```javascript
// Technology episode (cyan) at front-right, slightly elevated
{
  id: "episode-010",
  title: "AI and the Future of Work",
  spotifyEmbed: "https://open.spotify.com/embed/episode/ABC123",
  theta: 45,
  phi: 70,
  themes: ["technology", "business"]
}

// Science episode (magenta) at back-left, near horizon
{
  id: "episode-011",
  title: "The Mystery of Dark Matter",
  spotifyEmbed: "https://open.spotify.com/embed/episode/XYZ789",
  theta: 225,
  phi: 95,
  themes: ["science"]
}

// Health episode (green) directly above
{
  id: "episode-012",
  title: "Understanding Sleep Science",
  spotifyEmbed: "https://open.spotify.com/embed/episode/DEF456",
  theta: 0,
  phi: 30,
  themes: ["health", "science"]
}
```

## Understanding Coordinates

Think of yourself standing at the center of a giant sphere, looking outward at the stars.

### Theta (θ) - Horizontal Position (0-360°)

Where the episode appears as you spin in a circle:

- **0°** = Directly in front of you
- **90°** = To your right
- **180°** = Behind you
- **270°** = To your left

### Phi (φ) - Vertical Position (0-180°)

How high or low the episode appears:

- **0°** = Straight up (zenith)
- **45°** = Upper diagonal
- **90°** = Eye level (horizon)
- **135°** = Lower diagonal
- **180°** = Straight down (nadir)

### Positioning Tips

✅ **Do:**
- Spread episodes across all angles (0-360° theta)
- Use the full vertical range (don't cluster at phi=90°)
- Group related episodes in nearby regions
- Test positioning by rotating the sphere

❌ **Avoid:**
- Putting all episodes at the horizon (phi=90°)
- Clustering too many episodes in one spot
- Using only 0°, 90°, 180°, 270° for theta (use varied angles!)

### Quick Position Reference

| Location | Theta | Phi | Description |
|----------|-------|-----|-------------|
| Front Center | 0 | 90 | Eye level, straight ahead |
| Front Upper | 0 | 45 | Above eye level, ahead |
| Front Lower | 0 | 135 | Below eye level, ahead |
| Right | 90 | 90 | Eye level, to the right |
| Back | 180 | 90 | Eye level, behind |
| Left | 270 | 90 | Eye level, to the left |
| Top | any | 0-30 | Overhead |
| Bottom | any | 150-180 | Below |

## Enabling Spotify Embeds

Currently, the Spotify player is commented out and shows a "coming soon" message. To enable it:

### 1. Get Your Spotify Embed URL

1. Go to your episode on Spotify
2. Click the **•••** (three dots) menu
3. Select **Share** → **Embed episode**
4. Copy the URL (it should look like: `https://open.spotify.com/embed/episode/YOUR_EPISODE_ID`)

### 2. Uncomment the Spotify Code

Open `app.js` and find this section in the `openModal` function:

```javascript
// Spotify embed - uncomment when episodes are ready
// const iframe = document.createElement('iframe');
// iframe.className = 'spotify-embed';
// iframe.src = nodeData.spotifyEmbed;
// iframe.allowtransparency = 'true';
// iframe.allow = 'encrypted-media';
```

**Remove the `//` from each line:**

```javascript
// Spotify embed - uncomment when episodes are ready
const iframe = document.createElement('iframe');
iframe.className = 'spotify-embed';
iframe.src = nodeData.spotifyEmbed;
iframe.allowtransparency = 'true';
iframe.allow = 'encrypted-media';
```

### 3. Uncomment the Iframe Append

Find this line a bit further down:

```javascript
// modalContent.appendChild(iframe); // Uncomment when episodes are ready
```

**Change it to:**

```javascript
modalContent.appendChild(iframe);
```

### 4. Update the Description (Optional)

Find this section:

```javascript
description.textContent = 'This episode is coming soon! We\'re still cooking up the cosmic conversations...';
```

**Change it to something like:**

```javascript
description.textContent = 'Explore the fascinating insights and conversations in this episode. Listen below or click through to Spotify for the full experience.';
```

### 5. Save and Refresh

Save `app.js` and refresh your browser. Episodes will now show Spotify players!

## Navigation

### Desktop
- **Drag** to rotate the sphere
- **Click nodes** to open episode modals
- **Hover over nodes** to see episode titles
- **Click directional labels** to navigate to categories
- **Click X or outside modal** to close

### Mobile
- **Drag** to rotate the sphere
- **Tap nodes** to open episode modals
- **Tap directional labels** to navigate to categories
- **Tap outside modal** to close
- Only one modal can be open at a time on mobile

## Technical Details

### Theme Connections

Episodes are automatically connected by constellation lines when they share themes:

```javascript
// These two episodes will be connected (both have "science")
{ themes: ["technology", "science"] }
{ themes: ["science", "health"] }
```

### Performance Notes

- **Recommended**: 50-100 episodes for optimal performance
- **Maximum**: ~150 episodes before performance may degrade
- Connections are calculated once on page load
- Spotify iframes lazy-load only when modals open

### File Structure

```
Edge-of-Reality/
├── index.html          # Main HTML structure
├── styles.css          # All styling and animations
├── app.js              # 3D rendering and interaction logic
├── nodes-data.js       # Episode data (edit this to add episodes!)
├── README.md           # This file
└── SPECS.md           # Technical specifications
```

### Browser Compatibility

- ✅ Chrome, Firefox, Safari, Edge (modern versions)
- ✅ Mobile browsers with WebGL support
- ❌ Internet Explorer (not supported)

### Customization

**To add new categories:**

1. Add color to `app.js` in the `categoryColors` object:
```javascript
const categoryColors = {
  'technology': 0x00ffff,
  'newcategory': 0xff0088  // Add your hex color here
};
```

2. Update the README color table
3. Use the new category in episode themes

## Troubleshooting

**Episode not appearing?**
- Check that `id` is unique
- Verify theta is 0-360 and phi is 0-180
- Make sure themes array has at least one category
- Check browser console for errors

**Wrong color?**
- The **first** theme determines color
- Verify the theme matches a category in `categoryColors`
- Check spelling of theme name (case-sensitive)

**Connections not showing?**
- Episodes need shared themes to connect
- Check that theme names match exactly
- Refresh the page after adding episodes

**Spotify not playing?**
- Verify you've uncommented the embed code
- Check that the Spotify URL is correct
- Some episodes may have playback restrictions

---

**Need help?** Review `SPECS.md` for detailed technical documentation.
