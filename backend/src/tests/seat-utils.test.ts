import {
  getRowName,
  getRowIndex,
  isSeatWithinCapacity,
  SEATS_PER_ROW,
} from "@/utils/seat-utils.js";

describe("Testes Unitários de seat-utils", () => {
  describe("getRowName", () => {
    it("deve retornar a letra correta para índices de fileira simples (0 a 25)", () => {
      expect(getRowName(0)).toBe("A");
      expect(getRowName(1)).toBe("B");
      expect(getRowName(25)).toBe("Z");
    });

    it("deve retornar letras compostas para índices >= 26", () => {
      expect(getRowName(26)).toBe("AA");
      expect(getRowName(27)).toBe("AB");
      expect(getRowName(51)).toBe("AZ");
      expect(getRowName(52)).toBe("BA");
    });
  });

  describe("getRowIndex", () => {
    it("deve retornar o índice correto para letras simples de fileira", () => {
      expect(getRowIndex("A")).toBe(0);
      expect(getRowIndex("a")).toBe(0);
      expect(getRowIndex("B")).toBe(1);
      expect(getRowIndex("Z")).toBe(25);
    });

    it("deve retornar o índice correto para letras compostas", () => {
      expect(getRowIndex("AA")).toBe(26);
      expect(getRowIndex("AB")).toBe(27);
      expect(getRowIndex("AZ")).toBe(51);
      expect(getRowIndex("BA")).toBe(52);
    });
  });

  describe("isSeatWithinCapacity", () => {
    it("deve retornar verdadeiro para assentos válidos dentro da capacidade", () => {
      expect(isSeatWithinCapacity("A-1", 100)).toBe(true);
      expect(isSeatWithinCapacity("A-10", 100)).toBe(true);
      expect(isSeatWithinCapacity("J-10", 100)).toBe(true);
    });

    it("deve retornar falso se o assento estiver além da capacidade total", () => {
      expect(isSeatWithinCapacity("B-5", 10)).toBe(false); // A1-A10 = 10, B5 = 15 > 10
      expect(isSeatWithinCapacity("A-6", 5)).toBe(false);
    });

    it("deve retornar falso se o código do assento estiver malformatado", () => {
      expect(isSeatWithinCapacity("INVALID", 100)).toBe(false);
      expect(isSeatWithinCapacity("1-A", 100)).toBe(false);
      expect(isSeatWithinCapacity("A", 100)).toBe(false);
      expect(isSeatWithinCapacity("", 100)).toBe(false);
    });

    it("deve retornar falso se o número do assento estiver fora do limite por fileira (1-10)", () => {
      expect(isSeatWithinCapacity("A-0", 100)).toBe(false);
      expect(isSeatWithinCapacity(`A-${SEATS_PER_ROW + 1}`, 100)).toBe(false);
    });
  });
});
