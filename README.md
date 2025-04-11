# Spin Wheel

An interactive spinning wheel component for randomizing choices and awarding prizes. Built with vanilla JavaScript (ES6) and featuring a dark theme with purple accents.

<img src="examples/demo.gif" alt="Demo showing the spin wheel in action" width="450px">

## Features

- Pure vanilla JavaScript with no dependencies
- Interactive click-drag and touch-flick spinning
- Customizable spinning behavior with momentum and drag
- Responsive design that auto-adjusts to container size
- Dark theme with customizable colors
- Multiple spinning methods:
  - Manual spin with momentum
  - Programmatic spin to specific angles
  - Target specific items with custom animations
- Customizable segments with:
  - Individual colors and weights
  - Adjustable labels and text alignment
  - Custom background colors
- Event callbacks for spinning, resting, and selection changes

## Usage

1. Add the required files to your project:

```html
<script type="module" src="js/index.js"></script>
<link rel="stylesheet" href="css/index.css">
```

2. Create a container for the wheel:

```html
<div class="wheel-wrapper">
    <div class="wheel-pointer">▼</div>
</div>
```

3. Initialize the wheel with configuration:

```javascript
import {Wheel} from './wheel.js';

const props = {
    items: [
        { label: 'Option 1' },
        { label: 'Option 2' },
        { label: 'Option 3' }
    ],
    itemBackgroundColors: [
        '#997BFF', // Base Purple
        '#A88FFF', // Lighter shade
        '#8A6AE0', // Darker shade
    ],
    borderColor: '#997BFF',
    borderWidth: 2,
    lineColor: '#8A6AE0',
    itemLabelColors: ['#FFFFFF'],
    rotationSpeedMax: 1000,
    rotationResistance: -50
};

const container = document.querySelector('.wheel-wrapper');
const wheel = new Wheel(container, props);
```

## Configuration Options

### Wheel Properties

- `items`: Array of wheel segments
- `itemBackgroundColors`: Array of colors for segments
- `borderColor`: Color of wheel border
- `borderWidth`: Width of border in pixels
- `lineColor`: Color of lines between segments
- `rotationSpeedMax`: Maximum rotation speed
- `rotationResistance`: Resistance to slow down spinning

### Item Properties

- `label`: Text displayed on the segment
- `weight`: Relative size of the segment
- `backgroundColor`: Individual segment color
- `labelColor`: Text color for this segment

## Events

The wheel supports several events:

```javascript
wheel.onSpin = (event) => {
    console.log('Wheel started spinning!');
};

wheel.onRest = (event) => {
    console.log('Wheel stopped at:', event.currentIndex);
};

wheel.onCurrentIndexChange = (event) => {
    console.log('Current segment:', event.currentIndex);
};
```

## Methods

- `spin(speed)`: Spin the wheel with given speed
- `spinTo(angle, duration)`: Spin to specific angle
- `spinToItem(itemIndex, duration)`: Spin to specific item
- `stop()`: Stop the wheel immediately

## License

MIT License - feel free to use in your projects

## Contributing

Feel free to open issues or submit pull requests with improvements.
