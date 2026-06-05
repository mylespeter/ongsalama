// components/RouteLoader.tsx
"use client";

export default function RouteLoader() {


  return (
    <div className="fixed inset-0 bg-transparent  z-50 flex justify-center items-center">
      <div className="loader-small"></div>
      
      <style jsx>{`
      .loader-small {
  width: 24px;
  height: 24px;
  display: grid;
  border-radius: 50%;
  background:
    linear-gradient(0deg, rgb(75 85 99 / 50%) 30%, #0000 0 70%, rgb(75 85 99 / 100%) 0) 50% / 8% 100%,
    linear-gradient(90deg, rgb(75 85 99 / 25%) 30%, #0000 0 70%, rgb(75 85 99 / 75%) 0) 50% / 100% 8%;
  background-repeat: no-repeat;
  animation: l23 1s infinite steps(12);
}

.loader-small::before,
.loader-small::after {
  content: "";
  grid-area: 1/1;
  border-radius: 50%;
  background: inherit;
  opacity: 0.915;
  transform: rotate(30deg);
}

.loader-small::after {
  opacity: 0.83;
  transform: rotate(60deg);
}

@keyframes l23 {
  100% {
    transform: rotate(1turn);
  }
}
     
      `}</style>
    </div>
  );
}