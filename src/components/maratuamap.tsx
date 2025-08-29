const MaratuaMap = () => {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-semibold">Maratua Map</h2>
      <div className="mt-6 h-96 w-full overflow-hidden rounded-lg border border-neutral-200">
        <iframe
          src="https://www.google.com/maps/d/embed?mid=1vXHjv3F7ZlXK5Zz8Zz8Zz8Zz8Zz8Zz8&hl=en"
          width="100%"
          height="100%"
          className="border-0"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  );
};

export default MaratuaMap;