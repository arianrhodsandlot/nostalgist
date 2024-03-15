---
title: pressDown
---

Press a button programmatically.

Analog Joysticks are not supported by now.

## Since
`0.4.0`

## Usage
```js
const nostalgist = await Nostalgist.nes('flappybird.nes')

nostalgist.pressDown('select')
nostalgist.pressDown('start')
nostalgist.pressDown('a')
nostalgist.pressDown('left')
nostalgist.pressDown('l')
nostalgist.pressDown({ button: 'a', player: 2 }) // press the button "a" on player 2's controller
```

## Arguments
+ ### `options`

  **type:** `string | { button: string, player?: number }`

  if it's a string, then it's the same as `{ button: <options> }`

  if it's an object, please see below.

  + #### `button`
    **type:** `string`
    The button you want to press. Can be: `up`,`down`,`left`,`right`,`select`,`start`,`a`,`b`,`x`,`y`,`l`,`l2`,`l3`,`r`,`r2`,`r3`.

    The 'a', 'b', 'x', 'y' buttons here are using the SNES layout:
    > <pre><code> x<br>y a<br> b</code></pre>

  + #### `player`
    **type:** `number` **default:** `1`

    The player you want to control.

    If you want to control the player other than `1`, make sure you have set a key binding for that player in [`retroarchConfig`](/apis/launch#retroarchconfig) option while launching.
    For example:
    ```js
    await Nostalgist.launch({
      retroarchConfig: {
        // see https://github.com/libretro/RetroArch/blob/575859e5d76d921cb490f55afcd0bbca90d4a742/retroarch.cfg#L468-L483
        input_player2_up: 'num1',
        input_player2_left: 'num2',
        input_player2_down: 'num3',
        input_player2_right: 'num4',
      }

      /* ...other options */
    })
    ```
    Because we are using these key bindings to simulate the control.
