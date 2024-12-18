import { Box, Typography } from "@mui/material";

const Home = () => {
    return (
       <Box justifyContent={'center'} alignItems={'center'} display={'flex'} flexDirection={'column'} width={'100%'}> 
           <Typography variant="h1" fontWeight={700} gutterBottom color="primary">
           Sabonah
           </Typography>
           <img src="Sabonah.png" alt="Sabonah" />
       </Box>
    )
}

export default Home;