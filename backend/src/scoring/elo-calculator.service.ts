import { Injectable } from '@nestjs/common';

@Injectable()
export class EloCalculatorService {
  constructor(
    private D: number,
    private K: number,
    private distrFn: (place: number, places: number) => number
  ) {}

  newRating(rating: number[]) {
    const scores = this.scoreAmplifierDistribution(rating.length);

    const expectedScores = this.expectedScores(rating);

    const scaleFactor = this.K * (rating.length - 1);

    return rating.map(
      (x, i) => x + scaleFactor * (scores[i] - expectedScores[i])
    );
  }

  scoreAmplifierDistribution(participants: number) {
    return Array.from({ length: participants }, (x, i) =>
      this.distrFn(i + 1, participants)
    );
  }

  expectedScores(rating: number[]) {
    return Array.from({ length: rating.length }, (x, m) =>
      this.expectationForPlace(m, rating)
    );
  }

  private expectationForPlace(place: number, rating: number[]) {
    const denom = (rating.length * (rating.length - 1)) / 2;

    return (
      Array.from({ length: rating.length }, (x, n) =>
        place === n ? 0 : this.expectedScore(rating[place], rating[n])
      ).reduce((acc, x) => acc + x, 0) / denom
    );
  }

  private expectedScore(a: number, b: number): number {
    return 1 / (1 + 10 ** ((b - a) / this.D));
  }
}
