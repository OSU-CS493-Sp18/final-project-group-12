# Purpose

Beer is a beverage that has been enjoyed by most cultures throughout human history. As a species we have created a significant number of different types of this beverage - gone are the days of eating fermented fruit off the ground. Humans control our own production of fermented grains, fruit, or honey. How then, can we keep track of all of this information? When you’ve had a few to drink it’s not easy to figure out what is on tap at your favorite bar. What if you’re craving a wheat beer and you would rather not stumble around to find out who has one in stock? The best solution to that problem is an API. This API will allow users to retrieve, add, edit, and delete information pertaining to the consumption of delicious fermented hop water. Someone else has to design a front end for it though.

The API will serve 3 resources. Beer, breweries, and distributors. Beer is what you drink, a brewery is who made it, and the distributor is who you paid for it. 


# End points
### Beer
	GET /beers
	GET /beers/{id}
	POST /beers
	PATCH /beers/{id}
	DELETE /beers/{id}

### Breweries
	GET /breweries
	GET /breweries/{id}
	GET /breweries/{id}/beers
	POST /breweries
	PATCH /breweries/{id}
	DELETE /breweries/{id}
### Distributors
	GET /distributors
	GET /distributors/{id}
	GET /distributors/{id}/beers
	POST /distributors
	PATCH /distributors/{id}
	DELETE /distributors/{id}


### Stored Data
	BEER /beer
	Fields: name, style, abv, ibu, description, image
	
	BREWERIES /breweries
	Fields: name, locations, address, state, zip, phone
	
	BARS/STORES /distributors
	Fields: name, address, state, zip, owner, phone

### Security
	JWT Authorization

### Stack
	Node.js/Express

### Data
	MySQL - Beer/Breweries/Distributors
	MongoDB - Users/Bookmarks

### Containerization
	Docker
