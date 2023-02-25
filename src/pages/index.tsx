import {
  Box,
  Button,
  Center,
  Checkbox,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Link,
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
import { CreateCalendarEventResponse } from "types/Response";

import GitHub from "assets/github.png";

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
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>();

  const onSubmit = handleSubmit(async (formData) => {
    try {
      const repeatEnd = new Date(formData.repeatEnd || "1970-01-01");

      const { data } = await axios.post<CreateCalendarEventResponse>(
        "/api/meet",
        {
          start: new Date(formData.start).toISOString(),
          name: formData.name,
          repeatEnd: formData.repeat ? repeatEnd.toISOString() : undefined,
        }
      );

      setLink(`https://meet.google.com/${data.conferenceData.conferenceId}`);
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
        <Image src="/logo.png" alt="YCC Logo" width="432" height="216" />
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
          display={status === "authenticated" && !link ? "flex" : "none"}
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
        <Box w="full" gap="3" flexDir="column" display={link ? "flex" : "none"}>
          <Heading as="h3" size="md" textAlign="center">
            성공적으로 회의를 생성했습니다
          </Heading>
          <Box>
            <Input
              w="full"
              bgColor="blackAlpha.300"
              readOnly
              value={link}
              textAlign="center"
              onClick={() => {
                navigator.clipboard.writeText(link);
                toast({
                  title: "링크 복사됨",
                  description: "클립보드에 링크가 복사되었습니다",
                  status: "success",
                });
              }}
            />
            <Text color="blackAlpha.700" textAlign="end">
              클릭하여 복사하세요!
            </Text>
          </Box>
          <Button
            w="full"
            colorScheme="blue"
            onClick={() => {
              setLink("");
              reset();
            }}
          >
            다른 회의 생성
          </Button>
        </Box>
        <Divider w="full" />
        <Link
          display="flex"
          href={`https://github.com/${
            process.env.GITHUB_REPO || "maxswjeon/google-meet-generator"
          }`}
          isExternal
          justifyContent="center"
          alignItems="center"
        >
          <Image
            src={GitHub}
            width="16px"
            height="16px"
            alt="GitHub Logo"
            display="inline"
            mr="1"
          />
          {process.env.GITHUB_REPO || "maxswjeon/google-meet-generator"}
        </Link>
      </Center>
    </Center>
  );
}
