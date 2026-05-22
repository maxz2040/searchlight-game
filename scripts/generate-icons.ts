import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const svgPath = path.join(__dirname, '../public/favicon.svg')
const publicDir = path.join(__dirname, '../public')

async function generateIcons() {
  try {
    const sizes = [192, 512]

    for (const size of sizes) {
      const outputPath = path.join(publicDir, `icon-${size}.png`)

      await sharp(svgPath)
        .resize(size, size, {
          fit: 'cover',
          background: { r: 13, g: 14, b: 29, alpha: 1 }
        })
        .png()
        .toFile(outputPath)

      console.log(`Generated ${size}x${size} icon at ${outputPath}`)
    }

    console.log('Icon generation complete!')
  } catch (error) {
    console.error('Error generating icons:', error)
    process.exit(1)
  }
}

generateIcons()
