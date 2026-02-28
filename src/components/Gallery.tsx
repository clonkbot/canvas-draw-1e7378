import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { Heart, Image as ImageIcon } from "lucide-react";

export function Gallery() {
  const galleryItems = useQuery(api.gallery.list);
  const toggleLike = useMutation(api.gallery.toggleLike);

  if (galleryItems === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-stone-400 font-mono text-sm">Loading gallery...</span>
        </div>
      </div>
    );
  }

  if (galleryItems.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-stone-800 rounded-2xl flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-stone-600" />
          </div>
          <h3 className="text-xl font-semibold text-stone-300 mb-2">Gallery is empty</h3>
          <p className="text-stone-500 max-w-sm">
            Be the first to share your artwork! Create a drawing and click the share button.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-3xl font-bold text-stone-100 mb-2"
      >
        Community Gallery
      </motion.h2>
      <p className="text-stone-500 mb-6 md:mb-8">Discover amazing artwork from the community</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {galleryItems.map((item: typeof galleryItems[number], index: number) => (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative bg-stone-900 rounded-2xl overflow-hidden border border-stone-800 hover:border-stone-700 transition-all hover:shadow-xl hover:shadow-amber-500/5"
          >
            {/* Thumbnail */}
            <div className="aspect-square bg-stone-950 overflow-hidden">
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Info */}
            <div className="p-3 md:p-4">
              <h3 className="font-medium text-stone-200 truncate text-sm md:text-base">{item.title}</h3>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-stone-500">by {item.authorName}</span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleLike({ galleryItemId: item._id })}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    item.hasLiked
                      ? "bg-rose-500/20 text-rose-400"
                      : "bg-stone-800 text-stone-400 hover:text-rose-400"
                  }`}
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${item.hasLiked ? "fill-current" : ""}`}
                  />
                  {item.likes}
                </motion.button>
              </div>
            </div>

            {/* Hover gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent opacity-0 group-hover:opacity-60 transition-opacity pointer-events-none" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
