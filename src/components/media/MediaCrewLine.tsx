import React from 'react';
import { Link } from 'react-router-dom';

interface MediaCrewLineProps {
  label: string;
  people: { id: number; name: string }[];
}

const MediaCrewLine: React.FC<MediaCrewLineProps> = ({ label, people }) => {
  if (people.length === 0) return null;

  return (
    <p className="text-sm text-muted-foreground mb-3">
      {label}{' '}
      {people.map((person, i) => (
        <React.Fragment key={person.id}>
          {i > 0 && ', '}
          <Link to={`/actor/${person.id}`} className="text-white font-medium hover:underline">
            {person.name}
          </Link>
        </React.Fragment>
      ))}
    </p>
  );
};

export default MediaCrewLine;
