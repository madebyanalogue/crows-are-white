import { geoPath, geoEquirectangular } from 'd3-geo'
import { feature } from 'topojson-client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const land = JSON.parse(fs.readFileSync('/tmp/land-110m.json', 'utf8'))
const geo = feature(land, land.objects.land)
const projection = geoEquirectangular()
  .scale(360 / (2 * Math.PI))
  .translate([180, 90])
const pathGenerator = geoPath(projection)
const d = pathGenerator(geo)

const svg = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 180">',
  `<path d="${d}"/>`,
  '</svg>',
].join('')

const outputJsPath = path.join(__dirname, '../utils/worldMapOutline.js')
fs.writeFileSync(outputJsPath, `export const WORLD_LAND_PATH = ${JSON.stringify(d)}\n`)
console.log(`Wrote ${outputJsPath} (${d.length} chars)`)
