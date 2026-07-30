const serviceIntents = {
    Plumber: [
      "plumber",
      "leakage",
      "water leakage",
      "tap",
      "pipe",
      "drain",
      "blocked drain",
      "toilet",
      "bathroom",
      "pipe fitting",
      "water tank"
    ],
    Electrician: [
      "electrician",
      "switch",
      "wire",
      "wiring",
      "fan",
      "light",
      "power",
      "socket",
      "short circuit",
      "mcb",
      "electric fault"
    ],
    Carpenter: [
      "carpenter",
      "wood work",
      "woodwork",
      "door repair",
      "window repair",
      "cupboard",
      "wardrobe",
      "shelf",
      "furniture fitting",
      "hinge"
    ],
    Painter: [
      "paint",
      "painting",
      "wall paint",
      "house paint",
      "wall painting",
      "whitewash",
      "putty work",
      "color painting"
    ],
    "AC Repair": [
      "ac repair",
      "air conditioner repair",
      "ac not cooling",
      "ac service",
      "ac gas filling",
      "ac not working",
      "ac problem",
      "ac servicing"
    ],
    "AC Installation": [
      "ac installation",
      "new ac",
      "ac fitting",
      "split ac install",
      "window ac install",
      "install ac",
      "ac mounting"
    ],
    Cleaning: [
      "cleaning",
      "house cleaning",
      "home cleaning",
      "maid",
      "housekeeping",
      "flat cleaning",
      "general cleaning"
    ],
    "Deep Cleaning": [
      "deep cleaning",
      "full house cleaning",
      "thorough cleaning",
      "deep clean",
      "detailed cleaning",
      "move in cleaning",
      "move out cleaning"
    ],
    "Bathroom Cleaning": [
      "bathroom cleaning",
      "toilet cleaning",
      "washroom cleaning",
      "restroom cleaning",
      "bathroom deep clean"
    ],
    "Kitchen Cleaning": [
      "kitchen cleaning",
      "chimney cleaning",
      "platform cleaning",
      "kitchen deep clean",
      "cooking area cleaning"
    ],
    "Sofa Cleaning": [
      "sofa cleaning",
      "couch cleaning",
      "upholstery cleaning",
      "sofa shampoo",
      "sofa wash"
    ],
    "Home Tutor": [
      "tutor",
      "home tuition",
      "teacher",
      "tuition classes",
      "private tutor",
      "home teacher",
      "study help",
      "exam preparation"
    ],
    Cook: [
      "cook",
      "chef",
      "cooking",
      "meal preparation",
      "tiffin",
      "home cook",
      "food helper",
      "kitchen help"
    ],
    Driver: [
      "driver",
      "car driver",
      "taxi",
      "airport",
      "pickup",
      "drop",
      "chauffeur",
      "personal driver",
      "outstation driver"
    ],
    Gardener: [
      "gardener",
      "gardening",
      "lawn",
      "plants",
      "landscaping",
      "garden maintenance",
      "plant care",
      "lawn mowing"
    ],
    "Pest Control": [
      "pest control",
      "cockroach",
      "termite",
      "insect",
      "rodent",
      "mosquito",
      "bed bugs",
      "ant control",
      "fumigation"
    ],
    "Appliance Repair": [
      "appliance repair",
      "home appliance",
      "electronics repair",
      "appliance service",
      "gadget repair"
    ],
    "TV Repair": [
      "tv repair",
      "television repair",
      "led tv",
      "smart tv not working",
      "tv not turning on",
      "tv screen issue"
    ],
    "Refrigerator Repair": [
      "fridge repair",
      "refrigerator repair",
      "cooling issue",
      "fridge not cooling",
      "refrigerator service"
    ],
    "Washing Machine Repair": [
      "washing machine repair",
      "washer repair",
      "laundry machine",
      "washing machine not working",
      "washing machine service"
    ],
    "Microwave Repair": [
      "microwave repair",
      "oven repair",
      "microwave not heating",
      "microwave service"
    ],
    "RO Water Purifier Repair": [
      "ro repair",
      "water purifier repair",
      "filter change",
      "ro service",
      "ro not working",
      "purifier leakage"
    ],
    "Water Purifier Installation": [
      "ro installation",
      "water purifier install",
      "new filter",
      "install water purifier",
      "ro fitting"
    ],
    "CCTV Installation": [
      "cctv",
      "camera installation",
      "security camera",
      "cctv fitting",
      "surveillance camera",
      "install cctv"
    ],
    "Computer Repair": [
      "computer repair",
      "pc repair",
      "desktop repair",
      "computer not starting",
      "pc service"
    ],
    "Laptop Repair": [
      "laptop repair",
      "screen repair",
      "battery replacement",
      "laptop not turning on",
      "laptop service",
      "keyboard repair"
    ],
    "Mobile Repair": [
      "mobile repair",
      "phone repair",
      "screen crack",
      "mobile screen replacement",
      "phone not charging",
      "smartphone repair"
    ],
    "WiFi Installation": [
      "wifi installation",
      "router setup",
      "internet connection new",
      "install wifi",
      "router fitting"
    ],
    "Internet Setup": [
      "internet setup",
      "broadband",
      "wifi not working",
      "internet connection issue",
      "network setup"
    ],
    "Packers and Movers": [
      "packers and movers",
      "shifting",
      "relocation",
      "moving house",
      "house shifting",
      "packing service",
      "movers"
    ],
    "Furniture Assembly": [
      "furniture assembly",
      "ikea assembly",
      "bed assembly",
      "furniture fitting",
      "assemble furniture",
      "wardrobe assembly"
    ],
    "Furniture Repair": [
      "furniture repair",
      "chair repair",
      "table repair",
      "sofa repair",
      "bed repair",
      "broken furniture"
    ],
    "Tile Work": [
      "tile work",
      "tiling",
      "flooring tiles",
      "tile fitting",
      "tile installation",
      "floor tiles"
    ],
    "Masonry Work": [
      "masonry",
      "bricklaying",
      "cement work",
      "brick work",
      "wall construction",
      "mason"
    ],
    "POP Work": [
      "pop work",
      "plaster of paris",
      "pop ceiling",
      "pop design",
      "pop wall"
    ],
    "False Ceiling Work": [
      "false ceiling",
      "gypsum ceiling",
      "ceiling design",
      "ceiling work",
      "gypsum board"
    ],
    "Interior Design": [
      "interior design",
      "interior designer",
      "home design",
      "room design",
      "space planning",
      "decor design"
    ],
    "Home Renovation": [
      "home renovation",
      "house renovation",
      "remodeling",
      "home makeover",
      "renovation work",
      "house repair work"
    ],
    "Bathroom Renovation": [
      "bathroom renovation",
      "washroom remodel",
      "bathroom makeover",
      "bathroom redesign",
      "toilet renovation"
    ],
    "Kitchen Renovation": [
      "kitchen renovation",
      "modular kitchen",
      "kitchen makeover",
      "kitchen redesign",
      "kitchen remodel"
    ],
    "Security Guard": [
      "security guard",
      "watchman",
      "guard service",
      "security personnel",
      "gate keeper"
    ],
    Babysitter: [
      "babysitter",
      "child care",
      "baby sitting",
      "childminder",
      "kid care"
    ],
    Nanny: [
      "nanny",
      "child caretaker",
      "full time nanny",
      "infant care",
      "baby caretaker"
    ],
    "Elder Care": [
      "elder care",
      "senior citizen care",
      "old age care",
      "caretaker",
      "elderly assistance",
      "patient care"
    ],
    "Laundry Service": [
      "laundry",
      "washing service",
      "dhobi",
      "clothes washing",
      "laundry pickup"
    ],
    "Ironing Service": [
      "ironing",
      "press service",
      "pressing clothes",
      "iron clothes",
      "clothes pressing"
    ],
    "House Shifting Help": [
      "house shifting",
      "home shifting",
      "moving help",
      "shifting labour",
      "loading unloading"
    ],
    "Delivery Helper": [
      "delivery helper",
      "delivery boy",
      "courier",
      "parcel delivery",
      "delivery service"
    ]
  };

  export default serviceIntents;