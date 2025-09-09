// Script to generate app icons for iOS and Android
const fs = require('fs');
const path = require('path');

// SVG icon template
const iconSVG = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#000000"/>
  <g transform="translate(256, 256)">
    <!-- Spray paint can shape -->
    <rect x="-60" y="-120" width="120" height="200" rx="20" fill="#FF6600" />
    <rect x="-60" y="-140" width="120" height="40" rx="10" fill="#FF8800" />
    
    <!-- Nozzle -->
    <circle cx="0" cy="-140" r="15" fill="#333333" />
    
    <!-- Paint drips -->
    <ellipse cx="-30" cy="90" rx="15" ry="30" fill="#FF6600" opacity="0.8" />
    <ellipse cx="0" cy="100" rx="12" ry="25" fill="#FF6600" opacity="0.7" />
    <ellipse cx="25" cy="95" rx="10" ry="20" fill="#FF6600" opacity="0.6" />
    
    <!-- Location pin overlay -->
    <g transform="translate(40, -40)">
      <path d="M0-30 C-20-30 -30-20 -30 0 C-30 10 0 40 0 40 S30 10 30 0 C30-20 20-30 0-30 Z" fill="#FFFFFF" opacity="0.9"/>
      <circle cx="0" cy="0" r="10" fill="#000000" />
    </g>
    
    <!-- App name -->
    <text x="0" y="160" font-family="Arial Black, sans-serif" font-size="48" font-weight="900" text-anchor="middle" fill="#FFFFFF">GRAFTRACK</text>
  </g>
</svg>
`;

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// Save the SVG icon
fs.writeFileSync(path.join(publicDir, 'icon.svg'), iconSVG);

// For web browsers, we'll use the SVG directly or convert with an online tool
// The SVG can be converted to PNG using various tools or services

// Create a simple colored square as placeholder PNGs
const sizes = [192, 512, 180];
sizes.forEach(size => {
  console.log(`Icon ${size}x${size} should be generated from icon.svg`);
});

console.log('✅ Icon template created at public/icon.svg');
console.log('📝 Use an online SVG to PNG converter or design tool to create PNG versions');
console.log('   Recommended sizes: 180x180 (iOS), 192x192 (Android), 512x512 (Android)');