// Centralized map layout definition for RoomExploration2D
// Map dimensions: 2400 x 1600

export const MAP_WIDTH = 2400;
export const MAP_HEIGHT = 1600;

export const WALL_THICKNESS = 40;
export const DOOR_SIZE = 100;

// Hardcoded map geometry to create a connected mansion layout
// instead of arbitrary floating boxes
export const LAYOUT = {
  rooms: {
    hallway: {
      id: 'hallway',
      x: 1000, y: 200, width: 400, height: 1200,
      texture: 'wood_floor.png'
    },
    library: {
      id: 'library',
      x: 200, y: 200, width: 800, height: 600,
      texture: 'wood_floor.png'
    },
    study: {
      id: 'study',
      x: 200, y: 800, width: 800, height: 600,
      texture: 'wood_floor.png'
    },
    kitchen: {
      id: 'kitchen',
      x: 1400, y: 200, width: 800, height: 600,
      texture: 'stone_floor.png'
    },
    dining_room: {
      id: 'dining_room',
      x: 1400, y: 800, width: 800, height: 600,
      texture: 'stone_floor.png'
    }
  },
  
  // Doors are gaps in the walls where players can walk
  doors: [
    { x: 1000 - WALL_THICKNESS/2, y: 500, width: WALL_THICKNESS, height: DOOR_SIZE, horizontal: false }, // Hallway to Library
    { x: 1000 - WALL_THICKNESS/2, y: 1100, width: WALL_THICKNESS, height: DOOR_SIZE, horizontal: false }, // Hallway to Study
    { x: 1400 - WALL_THICKNESS/2, y: 500, width: WALL_THICKNESS, height: DOOR_SIZE, horizontal: false }, // Hallway to Kitchen
    { x: 1400 - WALL_THICKNESS/2, y: 1100, width: WALL_THICKNESS, height: DOOR_SIZE, horizontal: false }  // Hallway to Dining
  ],

  // Furniture acts as solid collision blocks within rooms
  furniture: [
    // Library Bookshelves
    { id: 'lib_shelf1', x: 220, y: 220, width: 600, height: 80, image: 'furniture_bookshelf.png', label: 'Bookshelf' },
    { id: 'lib_shelf2', x: 220, y: 400, width: 400, height: 80, image: 'furniture_bookshelf.png', label: 'Bookshelf' },
    { id: 'lib_shelf3', x: 220, y: 600, width: 400, height: 80, image: 'furniture_bookshelf.png', label: 'Bookshelf' },
    // Study Desk
    { id: 'study_desk', x: 400, y: 1000, width: 250, height: 120, image: 'furniture_desk.png', label: 'Mahogany Desk' },
    // Kitchen Stove & Counters
    { id: 'kit_stove', x: 2000, y: 220, width: 180, height: 100, image: 'furniture_stove.png', label: 'Iron Stove' },
    { id: 'kit_counter', x: 1500, y: 220, width: 400, height: 100, image: 'furniture_counter.png', label: 'Prep Counter' },
    // Dining Table
    { id: 'din_table', x: 1600, y: 1000, width: 400, height: 200, image: 'furniture_dining_table.png', label: 'Long Dining Table' }
  ]
};

// Generate walls based on the room dimensions, subtracting doors
export function generateWalls() {
  const walls = [];

  // Helper to add a wall segment if it's not overlapping a door
  const addWallSegment = (x, y, w, h) => {
    // We will do a simple check against doors, splitting walls if they intersect
    // For simplicity, let's just generate the 4 perimeter walls of each room 
    // and manually break them where doors are.
    walls.push({ x, y, width: w, height: h });
  };

  const R = LAYOUT.rooms;
  const T = WALL_THICKNESS / 2;

  // Since rooms share edges, we can define the main structural walls

  // Library Walls
  addWallSegment(R.library.x - T, R.library.y - T, R.library.width + T*2, WALL_THICKNESS); // Top
  addWallSegment(R.library.x - T, R.library.y + R.library.height - T, R.library.width + T*2, WALL_THICKNESS); // Bottom
  addWallSegment(R.library.x - T, R.library.y - T, WALL_THICKNESS, R.library.height + T*2); // Left

  // Study Walls
  addWallSegment(R.study.x - T, R.study.y - T, R.study.width + T*2, Math.max(0, WALL_THICKNESS)); // Top (Shared with Library Bottom technically, but we can overlap)
  addWallSegment(R.study.x - T, R.study.y + R.study.height - T, R.study.width + T*2, WALL_THICKNESS); // Bottom
  addWallSegment(R.study.x - T, R.study.y - T, WALL_THICKNESS, R.study.height + T*2); // Left

  // Kitchen Walls
  addWallSegment(R.kitchen.x - T, R.kitchen.y - T, R.kitchen.width + T*2, WALL_THICKNESS); // Top
  addWallSegment(R.kitchen.x - T, R.kitchen.y + R.kitchen.height - T, R.kitchen.width + T*2, WALL_THICKNESS); // Bottom
  addWallSegment(R.kitchen.x + R.kitchen.width - T, R.kitchen.y - T, WALL_THICKNESS, R.kitchen.height + T*2); // Right

  // Dining Walls
  addWallSegment(R.dining_room.x - T, R.dining_room.y - T, R.dining_room.width + T*2, WALL_THICKNESS); // Top
  addWallSegment(R.dining_room.x - T, R.dining_room.y + R.dining_room.height - T, R.dining_room.width + T*2, WALL_THICKNESS); // Bottom
  addWallSegment(R.dining_room.x + R.dining_room.width - T, R.dining_room.y - T, WALL_THICKNESS, R.dining_room.height + T*2); // Right

  // Hallway Top and Bottom caps
  addWallSegment(R.hallway.x - T, R.hallway.y - T, R.hallway.width + T*2, WALL_THICKNESS); // Top
  addWallSegment(R.hallway.x - T, R.hallway.y + R.hallway.height - T, R.hallway.width + T*2, WALL_THICKNESS); // Bottom

  // Shared inner vertical walls with doors punched out
  // Left inner wall (separates Library/Study from Hallway)
  addWallSegment(1000 - T, 200 - T, WALL_THICKNESS, 300 + T); // Top to Library door
  addWallSegment(1000 - T, 600, WALL_THICKNESS, 500); // Library door to Study door
  addWallSegment(1000 - T, 1200, WALL_THICKNESS, 200 + T); // Study door to Bottom

  // Right inner wall (separates Hallway from Kitchen/Dining)
  addWallSegment(1400 - T, 200 - T, WALL_THICKNESS, 300 + T); // Top to Kitchen door
  addWallSegment(1400 - T, 600, WALL_THICKNESS, 500); // Kitchen door to Dining door
  addWallSegment(1400 - T, 1200, WALL_THICKNESS, 200 + T); // Dining door to Bottom

  return walls;
}
