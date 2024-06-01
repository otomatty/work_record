import React, { useState, useEffect } from "react";
import styled from "styled-components";
import AddTeacherForm from "./AddTeacherForm";
import Modal from "../../../components/molecules/Modal";
import Button from "../../../components/atoms/Button/Button"; // Buttonコンポーネントをインポート
import ButtonGroup from "../../../components/layout/ButtonGroup";
import { getCurrentAndPreviousMonthTimes } from "../../../firebase/teachers/monthlySummaries/monthlySummaries"; // 修正
import { useNavigate } from "react-router-dom"; // 追加
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // FontAwesomeをインポート
import { faTrash, faEdit } from "@fortawesome/free-solid-svg-icons"; // 必要なアイコンをインポート

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  border: 2px solid #ccc; /* テーブルの外側の線を太く */
`;

const Th = styled.th`
  background-color: #f5f5f5;
  color: #333;
  padding: 10px;
  border: 1px solid #ddd;

  &.border-right {
    border-right: 2px solid #ccc; /* 境界の縦の線を太く */
  }
`;

const Td = styled.td`
  padding: 8px;
  border: 1px solid #ddd;
  text-align: right;
  &:nth-child(1) {
    text-align: center;
  }
  &:nth-child(1),
  &:nth-child(3) {
    border-right: 2px solid #ccc; /* 境界の縦の線を太く */
  }
`;

const TeacherNameTd = styled(Td)`
  cursor: pointer;
  &:hover {
    background-color: #f0f0f0; /* ホバー時の背景色 */
  }
`;

const DeleteIcon = styled(FontAwesomeIcon)`
  color: #dc3545;
  cursor: pointer;
  margin-left: 10px;
`;

const EditIcon = styled(FontAwesomeIcon)`
  color: #007bff;
  cursor: pointer;
  margin-left: 10px;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  box-sizing: border-box;
`;

interface Teacher {
  id: string;
  name: string;
}

interface Props {
  teachers: Teacher[];
  deleteMode: boolean;
  editMode: boolean; // 追加
  onDelete: (id: string) => void;
  onUpdate: (id: string, newName: string) => void; // 追加
  adding: boolean;
  onAdd: (name: string) => void;
  onCancel: () => void;
  isTimeFormat: boolean; // 追加
}

const TeacherTable: React.FC<Props> = ({
  teachers,
  deleteMode,
  editMode, // 追加
  onDelete,
  onUpdate, // 追加
  adding,
  onAdd,
  onCancel,
  isTimeFormat, // 追加
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(
    null
  );
  const [inputTeacherName, setInputTeacherName] = useState<string>("");
  const [monthlyTimes, setMonthlyTimes] = useState<{
    [key: string]: {
      currentMonth: { totalTeachTime: number; totalOfficeTime: number } | null;
      previousMonth: { totalTeachTime: number; totalOfficeTime: number } | null;
    };
  }>({});
  const navigate = useNavigate(); // 追加

  const formatTime = (minutes: number) => {
    if (isTimeFormat) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}時間 ${remainingMinutes}分`;
    }
    return `${minutes}分`;
  };

  useEffect(() => {
    const fetchMonthlyTimes = async () => {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1; // 月は0から始まるので+1

      const times = await Promise.all(
        teachers.map(async (teacher) => {
          const data = await getCurrentAndPreviousMonthTimes(
            teacher.id,
            currentYear,
            currentMonth
          );
          return {
            [teacher.id]: data,
          };
        })
      );

      setMonthlyTimes(Object.assign({}, ...times));
    };

    fetchMonthlyTimes();
  }, [teachers]);

  const handleDeleteClick = (id: string) => {
    setSelectedTeacherId(id);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    const selectedTeacher = teachers.find(
      (teacher) => teacher.id === selectedTeacherId
    );
    if (selectedTeacher && selectedTeacher.name === inputTeacherName) {
      onDelete(selectedTeacherId!);
      setIsModalOpen(false);
      setSelectedTeacherId(null);
      setInputTeacherName("");
    } else {
      alert("講師名が一致しません。");
    }
  };

  const handleCancelDelete = () => {
    setIsModalOpen(false);
    setSelectedTeacherId(null);
    setInputTeacherName("");
  };

  const handleTeacherClick = (id: string) => {
    navigate(`/work-record/${id}`, { replace: true });
  };

  const handleEditClick = (id: string) => {
    const newName = prompt("新しい講師名を入力してください:");
    if (newName) {
      onUpdate(id, newName);
    }
  };

  return (
    <>
      <Table>
        <thead>
          <tr>
            <Th rowSpan={2} className="border-right">
              講師名
            </Th>
            <Th colSpan={2} className="border-right">
              先月
            </Th>
            <Th colSpan={2}>今月</Th>
          </tr>
          <tr>
            <Th>教務時間</Th>
            <Th className="border-right">事務時間</Th>
            <Th>教務時間</Th>
            <Th>事務時間</Th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((teacher) => (
            <tr key={teacher.id}>
              <TeacherNameTd
                onClick={() => handleTeacherClick(teacher.id)}
                style={{ cursor: "pointer" }}
              >
                {teacher.name}
                {deleteMode && (
                  <DeleteIcon
                    icon={faTrash}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(teacher.id);
                    }}
                  />
                )}
                {editMode && (
                  <EditIcon
                    icon={faEdit}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(teacher.id);
                    }}
                  />
                )}
              </TeacherNameTd>
              <Td>
                {formatTime(
                  monthlyTimes[teacher.id]?.previousMonth?.totalTeachTime || 0
                )}
              </Td>
              <Td className="border-right">
                {formatTime(
                  monthlyTimes[teacher.id]?.previousMonth?.totalOfficeTime || 0
                )}
              </Td>
              <Td>
                {formatTime(
                  monthlyTimes[teacher.id]?.currentMonth?.totalTeachTime || 0
                )}
              </Td>
              <Td>
                {formatTime(
                  monthlyTimes[teacher.id]?.currentMonth?.totalOfficeTime || 0
                )}
              </Td>
            </tr>
          ))}
          {adding && (
            <tr>
              <Td colSpan={deleteMode || editMode ? 6 : 5}>
                <AddTeacherForm onAdd={onAdd} onCancel={onCancel} />
              </Td>
            </tr>
          )}
        </tbody>
      </Table>
      <Modal
        showCloseButton={false}
        isOpen={isModalOpen}
        message="一度削除すると元には戻せません。削除する講師名を入力してください。"
        onClose={handleCancelDelete}
      >
        <StyledInput
          type="text"
          value={inputTeacherName}
          onChange={(e) => setInputTeacherName(e.target.value)}
          placeholder="講師名を入力"
        />
        <ButtonGroup>
          <Button
            label="削除する"
            onClick={handleConfirmDelete}
            backgroundColor="#dc3545"
          />
          <Button
            label="戻る"
            onClick={handleCancelDelete}
            backgroundColor="#6c757d"
          />
        </ButtonGroup>
      </Modal>
    </>
  );
};

export default TeacherTable;
