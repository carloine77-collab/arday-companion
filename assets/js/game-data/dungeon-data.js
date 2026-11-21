/* Each threshold is the number of successful clears required in the previous tier.
   The cumulative path to SSS requires 233 successful clears across F–SS. */
window.ArdayDungeonData = {
 DUNGEON_TIERS: ['F','E','D','C','B','A','S','SS','SSS'],
 DUNGEON_CLEAR_REQUIREMENTS: {F:0,E:8,D:12,C:18,B:24,A:30,S:36,SS:45,SSS:60},
 DUNGEON_BASE_REWARD: {F:18,E:28,D:40,C:56,B:76,A:100,S:132,SS:170,SSS:220}
};
