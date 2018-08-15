# wordFreqEchoBot
===================
 INTRO
===================
The goal of this project is to make a pure ai chatbot that learns how to communicate based on relative word frequencies.
Stores relative word frequencies in a relational database using various metrics, including lists of words that occur directly after a given word--let's call the 'given word' wordA, and including a perceptron-weight for each word that occurs after the same wordA. The perceptron weights vary in frequency depending on how often that word occurs after wordA.


===================
 TRY IT!!!
===================
to test it out go to this website:
http://lucparis.x10host.com/Music.html#talkbot2000

or: gitclone the repo and run it by typing into the terminal/command_prompt: 'node app.js'
^without the quotes, of course.
Then go to your http://localhost3000 to see it running.



===================
 TODO
===================
The setup is not as efficient as it could be, i will be updating it when i have time.
Additional aspects of the project that I will implement are:
1) load the database into memory of the user's browser, adjust the database in the browser, then send the changes back to the    server to minimize server-computing time.
2) adjust it so that it can learn more words (currently limited to 10000 word vocabulary) and maybe even punctuation so that      it can write its own html!
3) implement a file caching system so that the bot can cache its own update by a nameing queue then access the updates when it    has free memory to spend on doing updates
4) find a more precise use for the perceptrons
5) think about how genetic programming could benefit the project
6) and anything else
