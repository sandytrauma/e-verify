import { ethers } from "ethers";
import votingAbi from "../public/AnonAadhaarVote.json";

const providerUrl = process.env.NEXT_PUBLIC_RPC_URL;

export const getTotalVotes = async (useTestAadhaar: boolean): Promise<any> => {
  const voteBreakdown = [
    { rating: 0, percentage: 0 },
    { rating: 1, percentage: 0 },
    { rating: 2, percentage: 0 },
    { rating: 3, percentage: 0 },
    { rating: 4, percentage: 0 },
    { rating: 5, percentage: 0 },
  ];

  const provider = ethers.getDefaultProvider(providerUrl);
  const voteContract = new ethers.Contract(
    `0x${
      useTestAadhaar
        ? process.env.NEXT_PUBLIC_VOTE_CONTRACT_ADDRESS_TEST
        : process.env.NEXT_PUBLIC_VOTE_CONTRACT_ADDRESS_PROD
    }`,
    votingAbi.abi,
    provider
  );

  const proposalCount = await voteContract.getProposalCount();

  // Initialize a variable to store the total vote count
  let totalVoteCount = 0;

  // Iterate through the proposals and sum their vote counts
  for (let i = 0; i < proposalCount; i++) {
    const voteCount = await voteContract.getProposal(i);
    totalVoteCount += Number(voteCount[1]);
  }

  await Promise.all(
    voteBreakdown.map(async (rating) => {
      const voteCount = await voteContract.getProposal(rating.rating);
      const percentage = Math.floor(
        (Number(voteCount[1]) / totalVoteCount) * 100
      );
      rating.percentage = percentage;
    })
  );

  return voteBreakdown;
};

export const hasVoted = async (
  userNullifier: string,
  useTestAadhaar: boolean
): Promise<boolean> => {
  const provider = ethers.getDefaultProvider(providerUrl);
  const voteContract = new ethers.Contract(
    `0x${
      useTestAadhaar
        ? process.env.NEXT_PUBLIC_VOTE_CONTRACT_ADDRESS_TEST
        : process.env.NEXT_PUBLIC_VOTE_CONTRACT_ADDRESS_PROD
    }`,
    votingAbi.abi,
    provider
  );

  return await voteContract.checkVoted(userNullifier);
};

export function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
