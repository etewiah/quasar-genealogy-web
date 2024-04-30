export default `
0 @I1@ INDI
1 NAME John /Smith/
1 FAMC @F1@
0 @I2@ INDI
1 NAME Peter /Smith/
0 @I3@ INDI
1 NAME Laura /Abbot/
0 @F1@ FAM
1 HUSB @I2@
1 WIFE @I3@
1 CHIL @I1@
`;
