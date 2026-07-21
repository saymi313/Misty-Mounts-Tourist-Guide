import React from 'react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { Tile } from '../bento/tiles';

// Night team tile — lime-ringed avatar, white name, lime role, muted bio + social buttons.
const OwnerCard = ({ name, role, bio, image, github, linkedin, delay = 0 }) => {
  return (
    <Tile glow="lime" delay={delay} pad="p-7" className="group flex flex-col items-center text-center">
      <img
        src={image}
        alt={name}
        className="h-28 w-28 rounded-full object-cover ring-4 ring-lime-400/30 transition-transform duration-300 group-hover:scale-105"
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
      <h3 className="mt-5 text-lg font-extrabold tracking-tight text-white">{name}</h3>
      <p className="text-sm font-semibold text-lime-400">{role}</p>
      <p className="mt-3 text-sm leading-relaxed text-white/60">{bio}</p>
      <div className="mt-5 flex gap-2">
        <a href={github} target="_blank" rel="noopener noreferrer"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-night-700 text-white/70 transition-colors hover:bg-lime-400 hover:text-night-950">
          <FaGithub className="h-4 w-4" />
        </a>
        <a href={linkedin} target="_blank" rel="noopener noreferrer"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-night-700 text-white/70 transition-colors hover:bg-lime-400 hover:text-night-950">
          <FaLinkedin className="h-4 w-4" />
        </a>
      </div>
    </Tile>
  );
};

export default OwnerCard;
