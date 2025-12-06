# PDF Biodata Structure Demo

## Visual Layout Preview

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Life-Time Biodata                    [Indigo, Bold]   │
│  Generated on 12/25/2024              [Gray, Small]    │
│                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                         │
│  Basic Information                    [Indigo Header]  │
│  ────────────────────                                   │
│  Name: John Doe                                        │
│  Age: 28                                               │
│  Marital Status: Never Married                         │
│  Religion: Muslim                                      │
│  Blood Group: O+                                       │
│  Height: 175 cm                                        │
│                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                         │
│  Location & Residency                 [Indigo Header]  │
│  ────────────────────                                   │
│  Current City: New York                                │
│  Current Country: US                                    │
│  Origin City: Lahore                                   │
│  Origin Country: PK                                    │
│  Visa Status: H1B                                      │
│  Citizenship: Pakistani                                │
│                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                         │
│  About                                [Indigo Header]  │
│  ────────────────────                                   │
│  I am a software engineer passionate about...          │
│  [Text wraps automatically to fit page width]         │
│                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                         │
│  Partner Expectations                 [Indigo Header]    │
│  ────────────────────                                   │
│  Looking for someone who shares similar values...     │
│                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                         │
│  Family Information                    [Indigo Header]  │
│  ────────────────────                                   │
│  Father's Occupation: Engineer                         │
│  Mother's Occupation: Teacher                          │
│  Siblings: 2 Brothers                                  │
│  Family Type: Nuclear Family                           │
│                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                         │
│  Lifestyle                            [Indigo Header]  │
│  ────────────────────                                   │
│  Alcohol: Never                                        │
│  Smoking: Never                                        │
│                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                         │
│  Education                             [Indigo Header]  │
│  ────────────────────                                   │
│  1. Bachelor of Science, Computer Science (2015-2019) │
│  2. Master of Science, Software Engineering (2019-2021)│
│                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                         │
│  Work Experience                      [Indigo Header]  │
│  ────────────────────                                   │
│  1. Software Engineer at Tech Corp (2021 - Present)   │
│                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                         │
│  Faith Tags                           [Indigo Header]  │
│  ────────────────────                                   │
│  Prayer, Charity, Fasting, Community Service          │
│                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                         │
│  Generated from Life-Time public profile (images excluded).│
│  [Gray, Small Footer]                                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Code Structure Breakdown

### 1. **PDF Setup** (Lines 212-216)
```javascript
const doc = new jsPDF({
  unit: 'pt',           // Points (1 inch = 72pt)
  format: 'a4',        // A4 paper size
  orientation: 'portrait' // or 'landscape'
});
```

### 2. **Page Layout** (Lines 220-228)
```javascript
const pageWidth = 595;   // A4 width in points
const pageHeight = 842;  // A4 height in points
const margin = 40;       // 40pt margin on all sides
const contentWidth = 515; // Usable width (595 - 80)
```

### 3. **Text Positioning** (Lines 226-228)
```javascript
let y = 40;              // Start at top margin
const lineHeight = 16;   // Space between lines
const sectionSpacing = 8; // Space before section headers
```

### 4. **Helper Functions**

#### `addLine()` - Adds regular text
```javascript
addLine('Name: John Doe', 12, false);
// Parameters: text, fontSize, isBold, color
```

#### `addSectionHeader()` - Adds styled section title
```javascript
addSectionHeader('Basic Information');
// Creates: Bold indigo text + underline
```

## Customization Examples

### Example 1: Change Colors
```javascript
// Make headers red instead of indigo
doc.setTextColor(255, 0, 0); // Red RGB
```

### Example 2: Change Font Sizes
```javascript
// Bigger title
doc.setFontSize(24); // Instead of 20

// Bigger section headers
doc.setFontSize(16); // Instead of 14
```

### Example 3: Add More Spacing
```javascript
const lineHeight = 20; // Instead of 16
const sectionSpacing = 12; // Instead of 8
```

### Example 4: Add a Border Around Page
```javascript
// After creating doc, add:
doc.setDrawColor(200, 200, 200);
doc.setLineWidth(1);
doc.rect(20, 20, pageWidth - 40, pageHeight - 40);
```

### Example 5: Add Page Numbers
```javascript
// In addLine function, add:
const pageNum = doc.internal.getCurrentPageInfo().pageNumber;
doc.text(`Page ${pageNum}`, pageWidth - 60, pageHeight - 20);
```

## Test It Out

1. Go to any public profile page (`/profiles/:id`)
2. Click "Download Biodata" button
3. Open the downloaded PDF to see the formatted biodata

## Current Features

✅ Clean section headers with indigo color
✅ Automatic text wrapping for long content
✅ Automatic page breaks when content is too long
✅ Consistent spacing and margins
✅ Professional formatting
✅ No images included (as requested)
✅ Date stamp showing when PDF was generated

