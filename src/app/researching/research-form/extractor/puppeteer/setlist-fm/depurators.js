import { MainExtractorError } from "../main-extractor-error.js";

export function setVenueMerge(core, venues, countries, concerts){
	try {
    let newVenues = venues;
    concerts = concerts.map(concert => {
      /* Venues */
      newVenues = newVenues.map(venue => {
        if(concert?.venue?.id === venue?.id){
          let locationList = concert?.venue?.name?.split(', ');
          let country = locationList?.pop();
          let name = locationList?.shift();
          let location = locationList?.join(', ');
          delete venue.name;
          return { ...venue, link: concert?.venue?.link, name, location, country };
        }
        return venue;
      });
      /* Concert Reduction */
      concert.venue = concert?.venue?.id;
      concert.tour = concert?.tour?.id;
      return concert;
    });
    return [[ ...newVenues ], concerts];
	} catch (error) {
    throw new MainExtractorError(core.DATA, error, 'Error general en la sección SET CONCERT MERGE');
	}
}

export function setTourIntervals(core, tours, concerts){
	try {
    let newTours = tours;
    newTours = newTours.map(tour => {
      if(tour.name){
        let firstIndex = concerts.findIndex(concert => concert?.tour?.id === tour.id);
        let lastIndex = concerts.reverse().findIndex(concert => concert?.tour?.id === tour.id);
        concerts.reverse();
        tour.firstConcert = {...concerts[firstIndex]};
        tour.firstConcert.venue = tour.firstConcert.venue.id;
        delete tour.firstConcert.tour;
        tour.lastConcert = {...concerts[lastIndex]};
        tour.lastConcert.venue = tour.lastConcert.venue.id;
        delete tour.lastConcert.tour;
      }
      return tour;
    });
    return [ ...newTours ];
	} catch (error) {
    throw new MainExtractorError(core.DATA, error, 'Error general en la sección SET TOUR INTERVALS');
	}
}