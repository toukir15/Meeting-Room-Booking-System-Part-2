import { DatePicker, Select, TimePicker } from "antd";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useGetRoomsQuery } from "../../../redux/features/roomManagement/roomManagementApi";
import "./CreateSlot.css";
import { useCreateSlotMutation } from "../../../redux/features/slotManagement/slotManagementApi";

export default function CreateSlot() {
  const [createSlot] = useCreateSlotMutation();
  dayjs.extend(customParseFormat);
  const { data: roomData } = useGetRoomsQuery(undefined);
  const dateFormat = "YYYY-MM-DD";

  interface TRoom {
    _id: string;
    roomName: string;
    roomNo: string; // Add roomNo to the TRoom interface
  }

  const options = roomData?.data.reduce(
    (acc: { value: string; label: string }[], room: TRoom) => {
      acc.push({
        value: room._id,
        label: room.roomName,
      });
      return acc;
    },
    []
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const handleCreateSlot = async (data) => {
    console.log(data);
    createSlot(data);
  };

  const handleStartTimeChange = (time, timeString) => {
    setValue("startTime", timeString);

    const endTime = dayjs(time).add(1, "hour");
    setValue("endTime", endTime.format("HH:mm"));
  };

  const disabledTime = () => {
    return {
      disabledHours: () => [23],
      disabledMinutes: () => [
        1, 2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14, 16, 17, 18, 19, 21, 22, 23, 24,
        26, 27, 28, 29, 31, 32, 33, 34, 36, 37, 38, 39, 41, 42, 43, 44, 46, 47,
        48, 49, 51, 52, 53, 54, 56, 57, 58, 59,
      ],
    };
  };

  const selectedDate = watch("date");
  const selectedStartTime = watch("startTime");

  const handleRoomNameChange = (value: string) => {
    const selectedRoom = roomData?.data.find(
      (room: TRoom) => room._id === value
    );

    if (selectedRoom) {
      setValue("roomNo", selectedRoom.roomNo);
    }
    setValue("room", value);
  };

  return (
    <div className="min-h-[calc(100vh-110px)] pt-10 pb-20 lg:pb-0 lg:pt-0 w-full flex lg:justify-center items-center container mx-auto">
      <form
        onSubmit={handleSubmit(handleCreateSlot)}
        method="post"
        className="flex lg:w-[50%] lg:mx-auto w-full px-4 flex-col"
      >
        {/* Room Name */}
        <div className="flex flex-col md:flex-row w-full md:items-center mb-2 md:mb-6">
          <label className="md:w-[30%] mb-1" htmlFor="roomName">
            Room Name
          </label>
          <Select
            className="w-[70%] border rounded-md"
            showSearch
            placeholder="Select a room"
            filterOption={(input, option) => {
              const label = option?.label;
              return (
                typeof label === "string" &&
                label.toLowerCase().includes(input.toLowerCase())
              );
            }}
            options={options}
            onChange={handleRoomNameChange}
            style={{
              padding: "6px",
              height: "42px",
              lineHeight: "1.25",
              borderColor: "#d9d9d9",
              borderRadius: "4px",
            }}
          />
          {errors.roomName && (
            <span className="text-red-500 text-sm">Room name is required</span>
          )}
        </div>

        {/* Room No */}
        <div className="flex flex-col md:flex-row w-full md:items-center mb-2 md:mb-6">
          <label className="md:w-[30%] mb-1" htmlFor="roomNo">
            Room No
          </label>
          <input
            {...register("roomNo", { required: true })}
            className="border py-2.5 lg:w-[70%] text-black outline-none border-gray-300 px-3 rounded text-sm"
            type="number"
            disabled
            placeholder="Room no"
          />
          {errors.roomNo && (
            <span className="text-red-500 text-sm">
              Room number is required
            </span>
          )}
        </div>

        {/* Date */}
        <div className="flex flex-col md:flex-row w-full md:items-center mb-2 md:mb-6">
          <label className="md:w-[30%] mb-1" htmlFor="date">
            Date
          </label>
          <DatePicker
            className="py-2.5 w-[70%]"
            value={selectedDate ? dayjs(selectedDate, dateFormat) : null}
            format={dateFormat}
            onChange={(date, dateString) => {
              setValue("date", dateString);
            }}
            disabledDate={(current) =>
              current && current < dayjs().startOf("day")
            }
          />
          {errors.date && (
            <span className="text-red-500 text-sm">Date is required</span>
          )}
        </div>

        {/* Start Time */}
        <div className="flex flex-col md:flex-row w-full md:items-center mb-2 md:mb-6">
          <label className="md:w-[30%] mb-1" htmlFor="startTime">
            Start Time
          </label>
          <TimePicker
            className="py-2.5 outline-none w-[70%]"
            onChange={handleStartTimeChange}
            format="HH:mm"
            disabledTime={disabledTime}
          />
          {errors.startTime && (
            <span className="text-red-500 text-sm">Start time is required</span>
          )}
        </div>

        {/* End Time */}
        <div className="flex flex-col md:flex-row w-full md:items-center mb-2 md:mb-6">
          <label className="md:w-[30%] mb-1" htmlFor="endTime">
            End Time
          </label>
          <TimePicker
            className="py-2.5 outline-none w-[70%]"
            value={
              selectedStartTime
                ? dayjs(selectedStartTime, "HH:mm").add(1, "hour")
                : null
            }
            disabled={true}
            onChange={(time, timeString) => setValue("endTime", timeString)}
            format="HH:mm"
          />
          {errors.endTime && (
            <span className="text-red-500 text-sm">End time is required</span>
          )}
        </div>

        {/* Submit and Cancel Buttons */}
        <div className="flex flex-col md:flex-row w-full md:items-center">
          <div className="md:w-[30%] mb-1"></div>
          <div className="md:lg:w-[70%] flex gap-6">
            <button
              type="submit"
              className="w-1/2 bg-rose-500 hover:bg-rose-600 text-white transition duration-150 font-medium py-3 px-4 rounded-lg"
            >
              Add Slot
            </button>
            <button
              type="button"
              className="w-1/2 border border-rose-500 hover:border-rose-600 text-rose-500 hover:text-rose-600 py-3 px-4 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
