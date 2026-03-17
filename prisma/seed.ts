import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hiraganaData, katakanaData } from "../src/data/kana";
import { n5Words } from "../src/data/words";

const connectionString =
  process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL || "";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Seed Kana Characters
  const allKana = [...hiraganaData, ...katakanaData];
  console.log(`Seeding ${allKana.length} kana characters...`);

  for (const kana of allKana) {
    await prisma.kanaCharacter.upsert({
      where: { id: kana.id },
      update: {
        character: kana.character,
        romaji: kana.romaji,
        type: kana.type,
        category: kana.category,
        row: kana.row,
        orderIndex: kana.orderIndex,
        strokeCount: kana.strokeCount,
      },
      create: {
        id: kana.id,
        character: kana.character,
        romaji: kana.romaji,
        type: kana.type,
        category: kana.category,
        row: kana.row,
        orderIndex: kana.orderIndex,
        strokeCount: kana.strokeCount,
      },
    });
  }

  // Seed Words
  console.log(`Seeding ${n5Words.length} N5 words...`);

  for (const word of n5Words) {
    await prisma.word.upsert({
      where: { id: word.id },
      update: {
        word: word.word,
        reading: word.reading,
        meaning: word.meaning,
        jlptLevel: word.jlptLevel,
        partOfSpeech: word.partOfSpeech,
        exampleSentence: word.exampleSentence ?? null,
        exampleReading: word.exampleReading ?? null,
        exampleMeaning: word.exampleMeaning ?? null,
        orderIndex: 0,
      },
      create: {
        id: word.id,
        word: word.word,
        reading: word.reading,
        meaning: word.meaning,
        jlptLevel: word.jlptLevel,
        partOfSpeech: word.partOfSpeech,
        exampleSentence: word.exampleSentence ?? null,
        exampleReading: word.exampleReading ?? null,
        exampleMeaning: word.exampleMeaning ?? null,
        orderIndex: 0,
      },
    });
  }

  console.log("Seeding complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
