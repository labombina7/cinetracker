import React from 'react';
import { Switch } from '@/components/ui/switch';
import { CreditKind } from '@/types/media';
import { TypeFilter } from '@/hooks/usePersonFilmography';
import { actorProfileTranslations } from '@/utils/translations/actorProfile';

type Translations = (typeof actorProfileTranslations)['es'];

interface FilmographyFiltersProps {
  t: Translations;
  type: TypeFilter;
  onTypeChange: (value: TypeFilter) => void;
  role: CreditKind | 'all';
  availableRoles: CreditKind[];
  onRoleChange: (value: CreditKind | 'all') => void;
  onlyMine: boolean;
  canFilterByPlatform: boolean;
  onOnlyMineChange: (value: boolean) => void;
}

const Chip: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`shrink-0 px-3 h-8 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
      active ? 'bg-yellow-400 text-black' : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
    }`}
  >
    {children}
  </button>
);

const FilmographyFilters: React.FC<FilmographyFiltersProps> = ({
  t,
  type,
  onTypeChange,
  role,
  availableRoles,
  onRoleChange,
  onlyMine,
  canFilterByPlatform,
  onOnlyMineChange
}) => {
  const types: { value: TypeFilter; label: string }[] = [
    { value: 'all', label: t.all },
    { value: 'movie', label: t.movies },
    { value: 'tv', label: t.series }
  ];

  return (
    <div className="flex flex-col gap-3 mb-6">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {types.map(({ value, label }) => (
          <Chip key={value} active={type === value} onClick={() => onTypeChange(value)}>
            {label}
          </Chip>
        ))}
      </div>

      {availableRoles.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          <Chip active={role === 'all'} onClick={() => onRoleChange('all')}>
            {t.allRoles}
          </Chip>
          {availableRoles.map((kind) => (
            <Chip key={kind} active={role === kind} onClick={() => onRoleChange(kind)}>
              {t.roles[kind]}
            </Chip>
          ))}
        </div>
      )}

      <label className={`flex items-center gap-2 text-sm ${canFilterByPlatform ? 'cursor-pointer' : 'opacity-60'}`}>
        <Switch checked={onlyMine} onCheckedChange={onOnlyMineChange} disabled={!canFilterByPlatform} />
        <span>{t.onlyMine}</span>
        {!canFilterByPlatform && <span className="text-xs text-muted-foreground">· {t.noPlatformsConfigured}</span>}
      </label>
    </div>
  );
};

export default FilmographyFilters;
