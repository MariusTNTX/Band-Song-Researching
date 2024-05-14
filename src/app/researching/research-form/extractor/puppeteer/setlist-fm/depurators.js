import { MainExtractorError } from "../main-extractor-error.js";

export function setTourIntervals(core, tours, concerts){
	try {
    tours.forEach(tour => {
      if(tour.name){
        let tourConcerts = concerts?.filter(concert => concert?.tour === tour?.id);
        if(tourConcerts?.length === 0) throw new MainExtractorError(core.DATA, {}, 'Algunos conciertos de tours no han sido encontrados');
        tour.firstConcert = { ...tourConcerts?.[tourConcerts?.length - 1] };
        tour.firstConcert.venue = tour?.firstConcert?.venue?.id;
        delete tour?.firstConcert?.tour;
        tour.lastConcert = { ...tourConcerts?.[0] };
        tour.lastConcert.venue = tour?.lastConcert?.venue?.id;
        delete tour?.lastConcert?.tour;
      }
      return tour;
    });
    return tours;
	} catch (error) {
    if(error instanceof MainExtractorError) throw error;
    else throw new MainExtractorError(core.DATA, error, 'Error general en la función SET TOUR INTERVALS');
	}
}

export function getTours(core, concerts){
	try {
    const tours = [];
    concerts.forEach(concert => {
      if(concert.tour){
        if(!tours.some(tour => tour?.id === concert?.tour?.id)){
          tours.push({ ...concert?.tour, concertCount: 1 });
        } else {
          tours.forEach(tour => tour.concertCount = tour?.id === concert?.tour?.id ? tour?.concertCount + 1 : tour?.concertCount);
        } 
        concert.tour = concert.tour.id;
      }
    });
    setTourIntervals(core, tours, concerts);
    return tours.sort((a, b) => b?.concertCount - a?.concertCount);
	} catch (error) {
    if(error instanceof MainExtractorError) throw error;
    else throw new MainExtractorError(core.DATA, error, 'Error general en la función GET TOURS');
	}
}

export function getYears(core, concerts){
	try {
    const years = [];
    concerts.forEach(concert => {
      if(!years.some(year => year?.year === concert?.date?.year)){
        years.push({ year: concert?.date?.year, concertCount: 1 });
      } else {
        years.forEach(year => year.concertCount = year?.year === concert?.date?.year ? year?.concertCount + 1 : year?.concertCount);
      } 
    });
    return years;
	} catch (error) {
    if(error instanceof MainExtractorError) throw error;
    else throw new MainExtractorError(core.DATA, error, 'Error general en la función GET YEARS');
	}
}

export function getVenues(core, concerts){
	try {
    const venues = [];
    concerts.forEach(concert => {
      if(!venues.some(venue => venue?.id === concert?.venue?.id)){
        let locationList = concert?.venue?.name?.split(', ');
        let country = locationList?.pop();
        let name = locationList?.shift();
        let location = locationList?.join(', ');
        venues.push({ ...concert?.venue, name, location, country, concertCount: 1 });
      } else {
        venues.forEach(venue => venue.concertCount = venue?.id === concert?.venue?.id ? venue?.concertCount + 1 : venue?.concertCount);
      } 
      concert.venue = concert?.venue?.id;
    });
    return venues.sort((a, b) => b?.concertCount - a?.concertCount);
	} catch (error) {
    if(error instanceof MainExtractorError) throw error;
    else throw new MainExtractorError(core.DATA, error, 'Error general en la función GET VENUES');
	}
}

export function getCountries(core, venues){
	try {
    const countries = [];
    venues.map(venue => {
      if(!countries.some(country => country?.name === venue?.country)){
        countries.push({ name: venue?.country, concertCount: 1 });
      } else {
        countries.forEach(country => country.concertCount = country?.name === venue?.country ? country?.concertCount + venue?.concertCount : country?.concertCount);
      } 
    });
    return countries.sort((a, b) => b?.concertCount - a?.concertCount);
	} catch (error) {
    if(error instanceof MainExtractorError) throw error;
    else throw new MainExtractorError(core.DATA, error, 'Error general en la función GET COUNTRIES');
	}
}