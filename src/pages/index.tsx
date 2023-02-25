import {
  Box,
  Button,
  Center,
  Checkbox,
  FormControl,
  FormLabel,
  Heading,
  Input,
  ListItem,
  Text,
  UnorderedList,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { Image } from "components/Image";
import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import { useState } from "react";
import { useForm } from "react-hook-form";

import logo from "~/logo.png";

type FormValues = {
  name: string;
  start: string;
  repeat: boolean;
  repeatEnd?: string;
};

export default function MainPage() {
  const toast = useToast();

  const { status } = useSession();

  const [link, setLink] = useState<string>("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<FormValues>();

  const onSubmit = handleSubmit(async (formData) => {
    try {
      const repeatEnd = new Date(formData.repeatEnd || "1970-01-01");
      const repeatEndString = `${repeatEnd.getFullYear()}-${repeatEnd.getMonth()}-${repeatEnd.getDate()}`;

      const { data } = await axios.post("/api/meet", {
        start: new Date(formData.start).toISOString(),
        name: formData.name,
        repeat: formData.repeat,
        repeatEnd: formData.repeat ? repeatEndString : undefined,
      });
    } catch (e: unknown) {
      if (!(axios.isAxiosError(e) && e.response)) {
        console.log(e);
        toast({
          title: "오류",
          description: "알 수 없는 오류가 발생했습니다",
          status: "error",
        });
        return;
      }
      toast({
        title: "오류",
        description: e.response.data.message,
        status: "error",
      });
    }
  });

  return (
    <Center w="full" h="full">
      <Head>
        <title>Google Meet - YCC</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="shortcut icon" type="image/png" href="favicon.png" />
      </Head>
      <Center
        w="full"
        maxW="480px"
        p="6"
        flexDir="column"
        gap="3"
        shadow="xl"
        rounded="xl"
      >
        <Image src={logo} alt="YCC Logo" w="full" h="auto" />
        <Heading as="h1" textAlign="center">
          Google Meet Link Generator
        </Heading>
        <Box
          display={status !== "authenticated" ? "flex" : "none"}
          flexDir="column"
          gap="3"
        >
          <Text textAlign="center" w="320px">
            YCC 계정으로 Google Meet 링크를 생성하여 다음과 같은 기능을
            이용하세요
          </Text>
          <UnorderedList>
            <ListItem>시간 제한 없는 모임</ListItem>
            <ListItem>회의 녹화</ListItem>
            <ListItem>소회의실</ListItem>
          </UnorderedList>
          <Button
            w="full"
            colorScheme="blue"
            onClick={() => signIn("keycloak")}
            isLoading={status === "loading"}
          >
            YCC 부원 로그인
          </Button>
        </Box>
        <Box
          as="form"
          w="full"
          gap="3"
          flexDir="column"
          display={status === "authenticated" ? "flex" : "none"}
          onSubmit={onSubmit}
        >
          <FormControl isRequired>
            <FormLabel>회의명</FormLabel>
            <Input {...register("name")} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>시작 시간</FormLabel>
            <Input type="datetime-local" {...register("start")} />
          </FormControl>
          <FormControl>
            <Checkbox {...register("repeat")}>반복</Checkbox>
          </FormControl>
          <FormControl display={watch("repeat") ? "block" : "none"}>
            <FormLabel>반복 종료</FormLabel>
            <Input type="date" {...register("repeatEnd")} />
          </FormControl>
          <Button
            type="submit"
            w="full"
            colorScheme="blue"
            isLoading={isSubmitting}
          >
            생성
          </Button>
        </Box>
      </Center>
    </Center>
  );
}
