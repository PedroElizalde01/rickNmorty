interface Props {
  name: string;
  airDate: string;
  code: string;
  onClick?: () => void;
}

export function EpisodeItem({ name, airDate, code, onClick }: Props) {
  return (
    <li className="episode-item" onClick={onClick}>
      <span className="episode-code">{code}</span>
      <span className="episode-name">{name}</span>
      <span className="episode-date">{airDate}</span>
    </li>
  );
}
