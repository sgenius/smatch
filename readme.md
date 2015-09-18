# Smatch (video game)

*Version 0.1.0*
A project to practice some of my front-end skills and test new ones.
By Fernando Augusto Lopez Plascencia.

## Objective

This is a _passion project_, but and also aims to be a practice of the following:

- *OOP using JS.* Javascript is a notoriously flexible language, easy to misuse. This game is both a practice of OOP and a way to (re)discover best practices about it.
- *Test of a MVC-like architecture.* I'm somewhat familiar with MVC, but probably never have used it in a pure state. This is no exception. For the architecture of this project I'm more influenced by MVVM (Model-View-ViewModel), which proposes a "ViewModel" layer that simply stands in the middle of the view and the core models. 
- *Client-server architecture in a multi-user environment.* This is something I'm quite interested in developing by myself, even though there are game-oriented frameworks that may handle it. Development in this hasn't started; for now I'm thinking in doing a server using Node.js, but this could change in the future as I explore my options. I might resort to another backend language entirely.
- *Multiple view types.* When the current, HTML-based view is finished up to a state I feel comfortable with, I intend to do another version of the view only. I'm still undecided on which direction this will take; it'll probably be either a canvas-based one.
- *A responsive game experience.* This falls into the UX category. Most of my work lately deals with responsive design, and I'm quite interested on exploring the potential of HTML/CSS/JS (first, with no canvas usage) to deliver a rich user experience that will work in any device.
- *A fun game.* Finally, the game should still be fun, and as compelling as possible.

## Description of the game

This is a **board-based** game, using a typical grid where chips of different types are laid. I did develop a series of rules for a similar board game beforehand, to use as reference. 

### The board game
The game is for 1 to 4 players and employs a board with a grid, a number of chips of four different kinds, a dice, a stack of cards, plus pen and paper for each player. 

The players take turns to either:
- Switch two chips in the table that are put next to each other ("adjacent" - only horizontally or vertically),
- Put a new chip in the table, which are taken from an opaque bag, or
- Collect chips from the board.

When a player collects chips, s/he registers them and puts them back into the bag. 

Each type of chip is worth a different amount of points. After all players have taken a turn, the dice is rolled once for each chip type: the dice roll tells whether that chip type value in points will go up or down.

There are also "wild" chips. These can take the place of any type of chip.

There are two types of patterns that the players can form with the chips, in order to be able to collect them from the board. 
- The simplest one is a block of the same type of chips (probably plus wilds). The block must be at least 1x3 or 2x2 and must have no holes (eg. squares with no chips in it).
- Another possibility is following the patterns given in a series of cards. These cards are taken randomly at the beginning of the game and put on the table, where all the players see them. The cards define patterns which may contain different types of chips and may contain "holes" in them. When completing one of these patterns in the board, there's a bonus (in points) for the player.

The game ends after a certain amount of turns, after which the points are tallied and whoever has the most, wins.

### Adaptation to a video game
I first thought of adapting the game simply as it was conceived. But, since one of the ideas of this project is to provide a compelling and fun user experience, it would have been neglectful to not consider the various ways in which the gameplay can be improved as a videogame.

As of version 0.1.0 ("Speeder"), the adaptations have been adapted for a more dynamic gameplay.

The following adaptations are in effect:
- *The game is time-based.* A "turn-based" game would work on a multiplayer environment and provide a more faithful "board game" experience. However, most board/strategy videogames are actually timed (see: Tetris and variations); the time limit allows for an added dimension in the game, calling for different strategies and an overall different experience. For now I'm dropping the "turn-based" approach in favor of an improved one-player-only game experience.
- *No time limit, but the game speeds itself on time.* This is the approach used by so many games of the Space Age, including the venerable Tetris. The game length will be determined by the player's skills. Plus, speeding games commonly provide exciting ends.
- *Some spaces in the board can be blocked.* That is, non-usable. This will allow for different board shapes and introduce another level of complexity.
- *In single player mode, the player can advance through a series of levels.* This would mean serving this data from a server, keeping track of the player's progress, and so on.   
- *The player can see which chips are randomly chosen by the computer for him to put next on the board.* This is similar to the "next" feature in Tetris. This allows the player to further strategize; specially observant players might be able to tell which chips are probably coming next. 
- *If the player delays, the computer will place the chip for him,* in a random, valid place. The length of time that this takes is what will determine the game rythm, and will be speeding up.
- *Chips can have variants.* That is, a certain chip can have "bonuses" such as "x2", "x3", "stop the clock", and so on. 
- *Chip value will change automatically.* Instead of the player having to "roll a dice" for the chip value to change, the machine will take care of that. In timed games, this would lead to the player dividing its attention between the state of the board and their value at the moment.
- *Collected chips convert to points at harvesting time*. The idea of manually having to monitor and change the value of each chip type is abandoned for simplicity
- *All chip type values will tend to increase as the game progresses.* So, when the game is faster, the chips are worth more. However, each chip type may still increase at different speeds, with different starting values, and so on. 
- *There can be a large number of chip types available to play.* Each chip type could have different characteristics - for example: starting value, frequency in which it can be put in the board, number and frequency of bonuses available, the behavior of its value with respect to time, and so on. The player would be introduced to different types on consecutive plays (eg. effectively having them available on time, collecting them in a similar way to Pokemon or other collecting games). The player might be able to choose which chip types to use in a certain game, creating "rosters", etc.
- *Timed multiplayer games are possible.* Exactly how this would work is something I'm still not exploring.
- *"Cards" are phased out.* I'm thinking the current description of the game already allows for a complicated enough gameplay for it to be interesting; adding a new level of complexity might not aid much, and may even detract from the game experience. - *The "points" are to be displayed as "money".* This will allow the player to better understand the gist of the game: s/he is collecting resources from the board and seeks to obtain the biggest gain from them on a market where those resources' values are worth more the more difficult (ie. speedier) the game becomes.

### Other non-functional considerations
- *The game is to be considered "casual".* This carries a number of non-functional requirements: for example, that the game can be played wherever, whenever, and that state can be quickly (automatically?) saved between sessions. Resuming a game should be quick and trivial. 
- *The user experience must be as smooth as possible.* This is a big challenge in and of itself, specially since (at least for now) the implementation is being done using pure HTML / CSS / JS as the delivery platform. This means having to think how a player will expect to interact with the game in a variety of devices. In this, design and interaction best practices will prove useful; e. g. using meaningful animations to communicate with the player.
- *The game must be easy to learn.* The game theory itself is more complicated than other so-called casual games, but I believe its complexity is still within the grasp of most players. Principles of gradual introduction should be used, and will be specially useful in designing the first interactions of the player with the game. I believe many recent games are quite good at this. Having increasingly difficult levels can greatly help in this. 
- *The game is to be developed iteratively.* The game development will not have strict iteration times, documents and so on, but it needs to be iterative in nature and provide frequent deliverables. 
- *The game code must be efficient.* This is, however, to be implemented gradually and on an "as needed" basis. As this is mostly a learning project, I do expect to refactorize the code a number of times before launching a public beta. Refining the code is important, but having important features come to life at all is even more important.

## History
### v0.1.0 - Sept, 17, 2015
- Updated this doc to reflect the direction change of the game to a "speedy" version. No functionality yet.
- I might do a major refactoring of the code in the (not very) near future, with a more formal structure and probably rearranging responsibilities between the model and the viewmodel. For now I'll focus on making the game fun for me to play, though.

### v0.0.3 - Sept. 17, 2015
- Updated slightly the look and feel of the board and subwindow so that it works on iPhone screens. (This was done last week but did not update the repo until today.)
- Implemented a minimum number of chips that must be present on a range to be valid. For now it's hard set to 5.

### v0.0.2 - Sept. 7, 2015
- Created *timer*. 
- A basic *game cycle* is now set. There's an initial screen to configure gameplay length, then the main game screen, then a *final screen* shown when the time's up. From here the game can restart. Reconfigure and then restart is not working properly yet.

For now the games will only last 5 secs; this is to test the game cycle.

#### In progress
- I just figured out that I never modeled data initialization around screens. I might need to reconfigure some code in order to modularize this. It'll be needed when (eventually) more screens are added to the app flux.
- Chip types, algorithms, and so on.


### v0.0.1 - Sept. 6, 2015
#### Already done
- *Base MVVM classes.* There is a single base model; it's within a somewhat strict class implementing a singleton pattern. The model class has a number of subclasses corresponding to different game objects; currently this consists of a Board and a Player class.
- *A playable demo* with basic interactions:
  - A starting board configuration is read from a JSON object; a board object is created and in it, chips are put.
  - A (single) player object is created.
  - In a starting screen, the player can enter a number of minutes for the game to last. (The results of this are not functional yet.)
  - In the game screen, the player can see the board and, in a so-called subwindow (a floating div), game info is displayed and refreshed.
  - The player can put new chips only in cells that are valid for that.
  - The player can switch adjacent chips. 
  - The player can define ranges and, if the range contains a valid range (eg. all the chips are of the same type, there are no "holes"), the chips are removed from the board and the player's count for that chip is increased.
  - States for the different objects in the board, and for the actions that the player performs on the board, are shown in a somewhat useful way.
  - A "next chip queue" is implemented and visible to the player. The chips in it are generated randomly, but according to preset probability values for each chip type.
  - The player can sell the collected chips at any given moment.
- A paper model of *a better interface*, more suited to the responsive nature of the current game view.
-

##### Non-functional
- The whole thing is up on a *repository*.
- There is a *Trello board* to keep track of features.

#### In progress
- A logical model of *how the chip values will vary*; this is mostly settled upon.
- *New model classes*: Chip, that will represent a single chip; ChipType, to represent a chip type and its characteristics. This will require a *refactoring* of the way the board is implemented.
- Thinking *how the different chip types will differentiate from each other* so that they might be more useful in some situations.


#### Next features in line
- Creating *timer methods*, or possibly a Timer class.
- Implementing *timed games*.
- Creating a *final screen* with the results of a game, once it ends.
- Implementing the whole *dynamic value change of each chip type*, with a simple random approach at first.
- Implementing the actual *chip value change algorithms*.
