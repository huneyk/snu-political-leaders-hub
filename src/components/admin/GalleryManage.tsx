import Image from 'next/image';

const getPlaceholderImage = (text: string) => {
  // Use a more reliable placeholder service
  const encodedText = encodeURIComponent(text);
  return `https://placehold.co/600x400/cccccc/666666/png?text=${encodedText}`;
};

{galleryItems.map((item) => (
  <div key={item._id} className="relative group">
    <Image
      src={item.imageUrl || getPlaceholderImage(item.title)}
      alt={item.title}
      width={600}
      height={400}
      className="object-cover rounded-lg"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = getPlaceholderImage(item.title);
      }}
    />
    // ... rest of the item rendering code ...
  </div>
))} 