
import fs from 'fs';

const filePath = 'C:\\Users\\PABLO\\Desktop\\OmnibetAPP\\src\\components\\DetailedMatchAnalysis.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// The problematic section is likely the end of the main component return.
// We need 4 closing divs before the return closure ');'

const searchPattern = /<\/div>\s+<\/div>\s+<\/div>\s+<\/div>\s+\);/g; // Try to find if it's already fixed
if (!content.match(searchPattern)) {
    // Look for the last part of the Dynamic Content Grid
    // and ensure exactly 4 levels of closing divs.

    // We'll replace the suspicious tail end:
    content = content.replace(/<\/div>\s+<\/div>\s+<\/div>\s+<\/div>\s+\);\s+}/g, '                </div>\n            </div>\n        </div>\n    </div>\n  );\n}');

    // Also fix the 3-level one if found
    content = content.replace(/<\/div>\s+<\/div>\s+<\/div>\s+\);\s+}/g, '                </div>\n            </div>\n        </div>\n    </div>\n  );\n}');

    // Remove potential typos like </div >
    content = content.replace(/<\/div >/g, '</div>');
}

fs.writeFileSync(filePath, content);
console.log('DetailedMatchAnalysis structure sanitized.');
