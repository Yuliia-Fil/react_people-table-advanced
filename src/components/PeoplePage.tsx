import { PeopleFilters } from './PeopleFilters';
import { Loader } from './Loader';
import { PeopleTable } from './PeopleTable';
import { useEffect, useMemo, useState } from 'react';
import { Person } from '../types';
import { getPeople } from '../api';
import { useLocation } from 'react-router-dom';

const getPreparedPeople = (
  people: Person[],
  sexFilter: string | null,
  queryFilter: string | null,
  centuriesFilter: string[],
) => {
  let preparedPeople = [...people];

  if (sexFilter) {
    preparedPeople = preparedPeople.filter(person => person.sex === sexFilter);
  }

  if (queryFilter) {
    preparedPeople = preparedPeople.filter(person => {
      const name = person.name.toLowerCase();
      const motherName = person.motherName
        ? person.motherName.toLowerCase()
        : '';
      const fatherName = person.fatherName
        ? person.fatherName.toLowerCase()
        : '';
      const qwery = queryFilter.toLowerCase();

      return (
        name.includes(qwery) ||
        motherName.includes(qwery) ||
        fatherName.includes(qwery)
      );
    });
  }

  if (centuriesFilter.length > 0) {
    preparedPeople = preparedPeople.filter(person => {
      const bornCentury = Math.ceil(person.born / 100);

      return centuriesFilter.some(century => +century === bornCentury);
    });
  }

  return preparedPeople;
};

export const PeoplePage = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const sexFilter = searchParams.get('sex');
  const queryFilter = searchParams.get('query');
  const centuriesFilter = searchParams.getAll('centuries');

  const preparedPeople = useMemo(
    () => getPreparedPeople(people, sexFilter, queryFilter, centuriesFilter),
    [people, sexFilter, queryFilter, centuriesFilter],
  );

  useEffect(() => {
    getPeople()
      .then(peopleFromServer => setPeople(peopleFromServer))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <h1 className="title">People Page</h1>

      <div className="block">
        <div className="columns is-desktop is-flex-direction-row-reverse">
          <div className="column is-7-tablet is-narrow-desktop">
            {people.length > 0 && !loading && !error && (
              <div className="block">
                <div className="box table-container">
                  <PeopleFilters />
                </div>
              </div>
            )}
          </div>

          <div className="column">
            <div className="box table-container">
              {loading && <Loader />}
              {error && (
                <p data-cy="peopleLoadingError">Something went wrong</p>
              )}
              {people.length === 0 && !loading && !error && (
                <p data-cy="noPeopleMessage">
                  There are no people on the server
                </p>
              )}

              <p>There are no people matching the current search criteria</p>
              {people.length > 0 && !loading && !error && (
                <div className="block">
                  <div className="box table-container">
                    <PeopleTable people={preparedPeople} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
