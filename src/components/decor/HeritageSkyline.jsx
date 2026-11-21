// Abstract heritage silhouette (domes, chhatris, arches). Decorative only.
export default function HeritageSkyline({ className = '' }) {
  return (
    <svg className={`skyline ${className}`} viewBox="0 0 1200 140" preserveAspectRatio="xMidYMax slice" aria-hidden="true" fill="currentColor">
      <path d="M0 140V112h60V96q0-16 14-16t14 16v16h40V90h14V76h-6l12-14 12 14h-6v14h14v22h80V96q0-14 12-14t12 14v16h40v-26q0-26 22-26h-2V54l10-16 10 16v6h-2q22 0 22 26v26h40V100q0-34 40-50V30l8-14 8 14v14q42 8 70 40 30-32 70-40V30l8-14 8 14v20q40 16 40 50v12h40V86q0-26 22-26h-2v-6l10-16 10 16v6h-2q22 0 22 26v26h40V96q0-14 12-14t12 14v16h80V90h14V76h-6l12-14 12 14h-6v14h14v22h40V96q0-16 14-16t14 16v16h60v28z" />
      <g opacity="0.55">
        <path d="M300 140v-14q0-10 10-10t10 10v14zM360 140v-14q0-10 10-10t10 10v14zM820 140v-14q0-10 10-10t10 10v14zM880 140v-14q0-10 10-10t10 10v14z" fill="#fff" />
      </g>
    </svg>
  );
}
