# Code Citations

## License: MIT
https://github.com/CrazyTim/spin-wheel/blob/9d98bc1ed06f832bc1d5f3499477df7a9fcf7c7a/src/wheel.js

```
const [i, a] of angles.entries()) {

      const item = this._items[i];

      const actualLabelColor = item.labelColor
        || (this._itemLabelColors[i % this
```


## License: MIT
https://github.com/CrazyTim/spin-wheel/blob/9d98bc1ed06f832bc1d5f3499477df7a9fcf7c7a/src/wheel.js

```
const [i, a] of angles.entries()) {

      const item = this._items[i];

      const actualLabelColor = item.labelColor
        || (this._itemLabelColors[i % this._itemLabelColors.length] // Fall back to a value from the repeating set.
        || 'transparent'); // Handle empty string/
```


## License: MIT
https://github.com/CrazyTim/spin-wheel/blob/9d98bc1ed06f832bc1d5f3499477df7a9fcf7c7a/src/wheel.js

```
+ Math.cos(util.degRad(angle + Constants.arcAdjust)) * (this._actualRadius * this.itemLabelRadius),
        this._center.y + Math.sin(util.
```


## License: MIT
https://github.com/CrazyTim/spin-wheel/blob/9d98bc1ed06f832bc1d5f3499477df7a9fcf7c7a/src/wheel.js

```
+ Math.cos(util.degRad(angle + Constants.arcAdjust)) * (this._actualRadius * this.itemLabelRadius),
        this._center.y + Math.sin(util.degRad(angle + Constants.arcAdjust)) * (this._actualRadius * this.itemLabelRadius)
      );
      ctx.rotate(util.degRad(angle + Constants.arcAdjust));
      ctx.rotate(util.degRad(this.itemLabelRotation
```

