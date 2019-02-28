# L-Systems Plant
**By Janine Liu / jliu99**

# External Resources

In addition to the class lectures and powerpoints, I consulted a few external resources for this project:
- http://pcgbook.com/wp-content/uploads/chapter05.pdf, for inspiration with the L-system grammar rules.
- https://www.turbosquid.com/3d-models/iconic-heart-3ds-free/389728, for the heart model
- https://www.turbosquid.com/3d-models/pot-garden-ma-free/957561, for the pot model

# Live GitHub demo
https://j9liu.github.io/hw4/

# L-System Ruleset

I incorporated probability into both my expansion and drawing rules. To pick an outcome, I would generate a random number, then sum the probability of the rules until it was equal to or greater than the random number.

The initial axiom provided was "SSSF."

**Expansion Rules**

'F' -> 'S-[SSSSLF]+S' with 25% probability, '[+SSSCLF]-CSSSLF' with 75% probability.

'S' -> 'SS+SL' with 10% probability, 'S+SLF' with 10% probability, 'S' with 80% probability.

**Drawing Rules**

'[' -> Push the turtle's current position and orientation onto the stack.

']' -> Pop the previous turtle's position and orientation off the stack.

'+' -> Rotate the user-specified angle counter-clockwise in the y- and z-directions.

'-' -> Rotate the user-specified angle clockwise in the y- and z-directions.

'S' -> Draw a straight branch, composed of one cylinder instance.

'C' -> Draw a curved branch, composed of a couple cylinder instances.

'F' -> Draw a fruit at the current position, with a random rotation.

'L' -> Draw a leaf at the current position.

# Aesthetic Features

The background is a simple gradient between a bright blue and pastel yellow, based on the y-coordinate of the screen.

![](background.png)

The pot is a free asset (linked above), colored and filled with a cylinder of dark brown for soil.

![](pot.png)

![](branches.png)

![](angle0.png)

![](angle20.png)

![](scaling.png)