interface Props {
  name: string;
  airDate: string;
  code: string;
}

export function EpisodeItem({ name, airDate, code }: Props) {
  return (
    <li className="episode-item">
      <span className="episode-code">{code}</span>
      <span className="episode-name">{name}</span>
      <span className="episode-date">{airDate}</span>
    </li>
  );
}
